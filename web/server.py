import os
from flask import Flask, request, render_template, redirect, url_for
from werkzeug.utils import secure_filename
 
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
 
if __name__ == '__main__':
    app.run(debug=True)
