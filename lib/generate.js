"use strict";

var fs = require('fs-extra');
var path = require('path');
var crypto = require('crypto');
var sanitizeHtml = require('sanitize-html');
var moment = require('moment');
var async = require('async');
var URL = require('url').URL;

var fetch = require('./fetch');
var rss = require('./rss');
var render = require('./render');
var sync = require('./sync');

module.exports = function (config) {
    var posts = [];
    var format = (config['planet'] && config['planet'].format ? String(config['planet'].format).toLowerCase() : 'html');
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
        var outputDir = path.join(config.BASEPATH, config['planet'].output);
        fs.ensureDir(outputDir, function (err) {
            if (err) {
                console.error('[ERROR] DIRECTORY:', outputDir);
                process.exit(1);
            }
            rss(posts, config);
            if (format === 'json') {
                var siteKeys = ['name', 'tagline', 'description', 'link', 'locale', 'items', 'items_feed', 'display_length', 'post_update', 'time_format', 'lazyload'];
                var site = {};
                siteKeys.forEach(function (key) {
                    if (Object.prototype.hasOwnProperty.call(config['planet'], key)) {
                        site[key] = config['planet'][key];
                    }
                });
                var data = {
                    site: site,
                    people: config['people'] || [],
                    posts: posts
                };
                var jsonPath = path.join(outputDir, 'data.json');
                fs.writeJson(jsonPath, data, { spaces: 2 }, function (writeErr) {
                    if (writeErr) {
                        console.error('[ERROR] JSON:', writeErr);
                    } else {
                        console.log('[INFO] JSON: Created', jsonPath);
                    }
                });
                return;
            }
            render(
                path.join(config.BASEPATH, 'templates', config['planet'].theme, 'index.ejs'),
                path.join(outputDir, 'index.html'),
                posts,
                config);
            sync(config);
        });
    });
};

module.exports.resolveUrl = resolveUrl;
module.exports._sanitize = function (content, config, origin) {
    return sanitize(content, config, origin);
};

function parsepost (post, avatar, config) {
    moment.locale(config['planet'].locale);
    var host = post.meta.link.substring(post.meta.link.length, post.meta.link.length - 1) === '/' ?
        post.meta.link.substring(0, post.meta.link.length - 1) : post.meta.link;
    var date = moment(post.pubdate).format(config['planet'].time_format);
    var update = post.date === post.pubdate ? null : moment(post.date).format(config['planet'].time_format);
    var _u = update && config['planet'].post_update ? moment(post.date).unix() : moment(post.pubdate).unix();
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
        xml: resolveUrl(host, post.meta.xmlurl),
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

function resolveUrl (base, value) {
    if (!value) {
        return value;
    }
    if (value.indexOf('data:') === 0) {
        return value;
    }
    try {
        if (base) {
            return new URL(value, base).toString();
        }
        return new URL(value).toString();
    } catch (err) {
        return value;
    }
}

function restoreimg (attribsrc, base) {
    return resolveUrl(base, attribsrc);
}

function sanitize (content, config, origin) {
    var host = origin.host;
    var link = origin.link;
    var base = link || host;
    return sanitizeHtml(content, {
        allowedTags: config['secure'].allowedTags,
        allowedAttributes: config['secure'].allowedAttributes,
        selfClosing: config['secure'].selfClosing,
        allowedSchemes: config['secure'].allowedSchemes,
        allowProtocolRelative: config['secure'].allowProtocolRelative,
        allowVulnerableTags: config['secure'].allowVulnerableTags === true,
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
                    var imgSource = attribs['data-src'] || attribs.src;
                    if (imgSource) {
                        newimgtag.attribs.src = restoreimg(imgSource, base);
                    }
                }
                return newimgtag;
            },
            'a': function (tagName, attribs) {
                if (attribs && attribs.href) {
                    var newAttribs = {};
                    Object.keys(attribs).forEach(function (key) {
                        newAttribs[key] = attribs[key];
                    });
                    newAttribs.href = resolveUrl(link || host, attribs.href);
                    return {
                        tagName: tagName,
                        attribs: newAttribs
                    };
                }
                return {
                    tagName: tagName,
                    attribs: attribs
                };
            }
        }
    });
}
