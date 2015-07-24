#!/usr/bin/env python

import logging
import os
import urllib

import flask
from datetime import timedelta
from functools import update_wrapper
from flask import make_response, request, current_app


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers
            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            h['Access-Control-Allow-Credentials'] = 'true'
            h['Access-Control-Allow-Headers'] = \
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator


def get_bug_dir(bug_id):
    bug_dir = '/mnt/bugs/files/0/'
    if bug_id:
        for i in bug_id:
            bug_dir += i + '/'
        return bug_dir

def get_files(d, fnfilter, dfilter, rel=True):
    d = os.path.expanduser(d)
    dirs = []
    fns = []
    for fn in sorted(os.listdir(d)):
        ffn = os.path.join(d, fn)
        if not rel:
            fn = ffn
        if os.path.isdir(ffn):
            if dfilter(ffn):
                dirs.append(fn)
        else:
            if fnfilter(ffn):
                fns.append(fn)
    return fns, dirs


def make_blueprint(app=None, register=True, fnfilter=None, dfilter=None):
    if fnfilter is None:
        fnfilter = lambda fn: True
    if dfilter is None:
        dfilter = lambda d: True
    main_dir = os.path.dirname(os.path.abspath(__file__))
    template_folder = os.path.join(main_dir, 'templates')
    static_folder = os.path.join(main_dir, 'static')
    logging.debug('filetree main_dir: %s' % main_dir)
    logging.debug('filetree template_folder: %s' % template_folder)
    logging.debug('filetree static_folder: %s' % static_folder)
    filetree = flask.Blueprint('filetree', 'filetree', \
            template_folder=template_folder, static_folder=static_folder)
#    filetree.bug_dir = '/mnt/bug/files/0/1/4/5/0/3/4/1'

    @filetree.route('/json')
    def dirlist():
        try:
            d = urllib.unquote(flask.request.args.get('dir', './'))
            fns, dirs = get_files(d, fnfilter, dfilter, rel=False)
            error = ""
        except Exception as E:
            fns = []
            dirs = []
            error = "PY: %s" % E
        return flask.jsonify(fns=fns, dirs=dirs, error=error)

    @filetree.route('/sfiles', methods=['POST'])
    def sfiles():
        r = []
        try:
            d = urllib.unquote(flask.request.form.get('dir', './'))
            fns, dirs = get_files(d, fnfilter, dfilter, rel=True)
            r = ['<ul class="jqueryFileTree" style="display: none;">']
            for f in dirs:
                ff = os.path.join(d, f)
                r.append('<li class="directory collapsed">' \
                        '<a href="#" rel="%s/">%s</a></li>' % (ff, f))
            for f in fns:
                ff = os.path.join(d, f)
                e = os.path.splitext(f)[1][1:]  # get .ext and remove dot
                r.append('<li class="file ext_%s">' \
                '<a href="#" rel="%s">%s</a></li>' % (e, ff, f))
            r.append('</ul>')
        except Exception as E:
            r.append('Could not load directory: %s' % (str(E)))
        return ''.join(r)
    
    ####bug_dir is the path to bugzilla data!!!
    @filetree.route('/bugs')
    @crossdomain(origin='*')
    def bugs():
        print "test!!!!"
        bugid = request.args['id']
        print bugid
        return flask.render_template('filetree_test.html', bug_dir= get_bug_dir(bugid))


    # dirty fix for flask static bug
    @filetree.route('/files/<path:path>')
    def files(path):
        return filetree.send_static_file(path)

    if register:
        if app is None:
            app = flask.Flask('filetree')
        app.register_blueprint(filetree, url_prefix='/filetree')
        return filetree, app
    return filetree

def test(**kwargs):
    ft, app = make_blueprint(register=True)
    logging.debug(app.url_map)
    app.run(**kwargs)


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    test()
