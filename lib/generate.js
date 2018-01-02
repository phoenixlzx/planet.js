"use strict";

var fs = require('fs-extra');
var path = require('path');
var crypto = require('crypto');
var sanitizeHtml = require('sanitize-html');
var moment = require('moment');
var async = require('async');

var fetch = require('./fetch');
var rss = require('./rss');
var render = require('./render');
var sync = require('./sync');

module.exports = function (config) {
    var posts = [];
    async.eachSeries(config['people'], function (c, callback) {
        fetch(c.link, config, function(ps) {
            if (ps.length > 0) {
                ps.forEach(function (p) {
                    posts.push(parsepost(p, c.avatar, config));
                });
            }
            callback();
        });
    }, function () {
        posts.sort(function (a, b) {
            // newest on top
            return b._u - a._u;
        });
        fs.ensureDir(config.BASEPATH + config['planet'].output, function (err) {
            if (err) {
                console.error('[ERROR] DIRECTORY:', config.BASEPATH + config['planet'].output);
                process.exit(1);
            }
            rss(posts, config);
            render(
                path.join(config.BASEPATH, 'templates', config['planet'].theme, 'index.ejs'),
                path.join(config.BASEPATH, config['planet'].output, 'index.html'),
                posts,
                config);
            sync(config);
        });
    });
};

function parsepost (post, avatar, config) {
    moment.locale(config['planet'].locale);
    var host = post.meta.link.substring(post.meta.link.length, post.meta.link.length - 1) === '/' ?
        post.meta.link.substring(0, post.meta.link.length - 1) : post.meta.link;
    var date = moment(post.pubdate).format(config['planet'].time_format);
    var update = post.date === post.pubdate ? null : moment(post.date).format(config['planet'].time_format);
    var _u = update ? moment(post.date).unix() : moment(post.pubdate).unix();
    return {
        _u: _u,
        _length: sanitizeHtml(post.description, {
            allowedTags: []
        }).replace(/\s/g,'').length,
        _summary_text: sanitizeHtml(post.description, {
            allowedTags: []
        }).replace(/\s/g,' ').substring(0, 139),
        _t_rfc3339: moment(post.date).format('YYYY-MM-DDTHH:mm:ssZ'),
        _t_rfc822: moment(post.date).format('ddd, DD MMM YYYY HH:mm:ss ZZ'),
        title: post.title,
        author: post.author,
        date: date,
        update: update,
        categories: post.categories,
        link: validuri(post.origlink ? post.origlink : post.link),
        summary: sanitize(post.summary, config, {host: host, link: post.link}),
        content: sanitize(post.description, config, {host: host, link: post.link}),
        channel: post.meta.link,
        xml: host + post.meta.xmlurl,
        avatar: avatar ? avatarlink(avatar) : null
    };
}

function avatarlink (avatar) {
    var p_email = new RegExp(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/i);
    return p_email.test(avatar) ?
        'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(avatar.toLowerCase()).digest("hex") : avatar;
}

function validuri (uri) {
    var r = new RegExp(/%[0-9a-f]{2}/i);
    return r.test(uri) ? uri : encodeURI(uri);
}

function restoreimg (attribsrc, host) {
    if (attribsrc.startsWith('/') && !attribsrc.startsWith('//')) {
        return host + attribsrc;
    } else if (attribsrc.startsWith('//') ||
        attribsrc.startsWith('http://') ||
        attribsrc.startsWith('https://') ||
        attribsrc.startsWith('data:image')) {
        return attribsrc;
    } else {
        // relative path incorrect?
        return host + '/' + attribsrc;
    }
}

function sanitize (content, config, origin) {
    var host = origin.host;
    var link = origin.link;
    return sanitizeHtml(content, {
        allowedTags: config['secure'].allowedTags,
        allowedAttributes: config['secure'].allowedAttributes,
        selfClosing: config['secure'].selfClosing,
        allowedSchemes: config['secure'].allowedSchemes,
        allowProtocolRelative: config['secure'].allowProtocolRelative,
        parser: {
            lowerCaseTags: true
        },
        transformTags: {
            // restore origin links
            'img': function (tagName, attribs) {
                var newimgtag = {
                    tagName: tagName,
                    attribs: {}
                };
                if (attribs) {
                    if (attribs.src) {
                        newimgtag.attribs.src = restoreimg(attribs.src, host);
                        if (attribs['data-src']) {
                            newimgtag.attribs['data-src'] = restoreimg(attribs['data-src'], host);
                        }
                    }
                }
                return newimgtag;
            },
            'a': function (tagName, attribs) {
                if (attribs && attribs.href) {
                    if (attribs.href.startsWith('#')) {
                        return {
                            tagName: tagName,
                            attribs: {
                                href: link + attribs.href
                            }
                        }
                    } else if (attribs.href.startsWith('/') && attribs.href.charAt(1) !== '/') {
                        return {
                            tagName: tagName,
                            attribs: {
                                href: host + attribs.href
                            }
                        }
                    }
                }
                return {
                    tagName: tagName,
                    attribs: attribs
                };
            }
        }
    });
}
