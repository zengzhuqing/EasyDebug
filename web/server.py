import os
from flask import Flask, request, render_template, redirect, url_for
from werkzeug.utils import secure_filename
from subprocess import * 
import json
from flask import make_response, request, current_app
app = Flask(__name__)
UPLOAD_FOLDER = 'upload'
 
@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'GET':
        return render_template('upload.html')
    elif request.method == 'POST':
        f = request.files['file']
        fname = secure_filename(f.filename)
        f.save(os.path.join(UPLOAD_FOLDER, fname))
        return "OK"

@app.route('/file_import', methods=['POST'])
def file_import():
    for key in request.form:
        print key + " : " + request.form[key]
    return "import file..."     
 
@app.route('/')
def index():
    return redirect(url_for('upload'), 302)

def get_search_res(index, doc_type, query):
    ans = {}
    search_dsl = '{"query":{"regexp":{"text":\"%s\"}}}' %(query)
    es_url = 'http://cybertron.eng.vmware.com:9200/%s/%s/_search?pretty=1' %(index, doc_type)
    child = Popen(["curl", es_url, "-d", search_dsl], stdout=PIPE)  
    json_res = child.communicate(None)[0]
    jres = json.loads(json_res)
    ans_list = []
    for item in jres['hits']['hits']:
        cur = {} 
        cur['id'] = item['_id']
        cur['summary'] = item['_source']['summary']
        ans_list.append(cur)
    response = make_response(json.dumps({'hits': ans_list}))
    response.content_type = "application/json"
    return response 

@app.route('/bz_search')
def bz_search():
    search_str = request.args['q']
    return get_search_res("bugzilla", "text", search_str)
  
@app.route('/ikb_search')
def ikb_search():
    search_str = request.args['q']
    return get_search_res("ikb", "kb", search_str)

if __name__ == '__main__':
    app.run(debug=True)
