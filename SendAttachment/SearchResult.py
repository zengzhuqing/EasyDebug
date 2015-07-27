#-*- coding:utf-8 -*-
'''
'''
from flask import Flask, jsonify
app = Flask(__name__)
app.debug = True
from datetime import timedelta
from flask import make_response, request, current_app, render_template
from functools import update_wrapper
import json

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

def getBzResult(string):
    results = list()
    result = dict()
    result['bug_id'] = 23123
    result['summary'] = '23123 summary'
    results.append(result)

    result = dict()
    result['bug_id'] = 99988
    result['summary'] = '99988 summary'
    results.append(result)

    return results

def getIkbResult(string):
    results = list()
    result = dict()
    result['kb_id'] = 23123
    result['summary'] = '23123 kb summary'
    results.append(result)

    result = dict()
    result['kb_id'] = 2003715
    result['summary'] = '2003715 kb summary'
    results.append(result)

    return results

@app.route("/regexSearch")
@crossdomain(origin='*')
def regexSearch():
    res = dict()
    para = request.args
    data = para.get('data', '').strip()
    data = json.loads(data)
    results = list()
    for regexItem in data:
        bzResult = getBzResult(regexItem)
        ikbResult = getIkbResult(regexItem)
        results.append([regexItem, bzResult, ikbResult])
    #raise Exception('xyz')
    res['res'] = 'success'
    res['data'] = render_template('search_result.html', results = results)

    return render_template('search_result.html', results = results)

    return jsonify(res);

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5555)