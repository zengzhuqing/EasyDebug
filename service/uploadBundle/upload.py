import os
from flask import Flask, render_template, request, url_for, redirect, Response

from flask.ext.restful import Api, Resource

from datetime import timedelta
from functools import update_wrapper
from flask import make_response, request, current_app
import tarfile


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


app = Flask(__name__)
api = Api(app)


@app.route('/')
@crossdomain(origin='*')
def hello_world():
    return 'Hello World!'


@app.route('/api/v1.0/bundle', methods=['GET', 'POST'] )
@crossdomain(origin='*')
def index():
    if request.method == 'POST':
	print request.values
      
        bug_id = request.values['BUGID']
	print bug_id
        file_name = request.values['FILE']
	print file_name
        action = request.values['ACTION']
        print action

        split_filename = file_name.rsplit('.', 1)

        if "tgz" in split_filename or file_name[-1] == "/" : 
            if action == 'extract':
		print "bbbbbbbbbbbbbbbbbbbbbba"
		fn = file_name.decode('unicode-escape')
                basepath = os.path.dirname(file_name)
                print "tar zxvf " + fn + ' -C ' + basepath
		tar = tarfile.open(fn, "r:gz")
		extracted = tar.next().name.split("/")[0]
		print extracted
		s = fn.rsplit("/")[-1];
		print s
		fn = fn.replace(s, "")
		print fn
	#	ls = tar.list()
		
		print "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                os.system("umask 000;tar zxvf " + file_name + ' -C ' + basepath)
                os.system("cd " + fn + extracted + '/' + '; ./reconstruct.sh')
                print "cd " + fn + extracted + '/' + '; ./reconstruct.sh'

            elif action == 'loginsight':
		if file_name[-1] == "/" :
			print file_name + " is a fffffffffffffffolder"
			pass
		else :
			print file_name + " is a llllllllllllllllle"
	                new_folder = "/root/bundle_temp/" + split_filename[0]
       		        print new_folder
                	os.system("rm -rf " + new_folder)
                	os.system("mkdir -p " + new_folder)
                	# os.mkdirs( new_folder )
                	os.system("tar zxvf " + file_name + " -C " + new_folder)
                	file_name = new_folder + '/' + os.listdir(new_folder)[0]

                os.system("gzip -d " + file_name + '/var/run/log/vmkernel.*.gz')
                os.system("gzip -d " + file_name + '/var/run/log/hostd.*.gz')

                commandline = "/build/apps/contrib/bin/loginsight-importer --server 10.24.62.162 --logdir /tmp --username admin --password 'VMca$hc0w' --source " + file_name + \
                              " --manifest /root/easydebug_manifest.ini --honor_timestamp --tags " + \
                              "\"{\\\"prid\\\":\\\"" + bug_id + "\\\"}\""
                print commandline

                os.system(commandline)
        else:
            resp = Response("", status=500, mimetype='application/json')


        resp = Response("", status=200, mimetype='application/json')

        return resp
        #     file = request.files['file']
        #     if file and allowed_file(file.filename):
        #         filename = secure_filename(file.filename)
        #         tid = create_task_dir()
        #         saved_file = 'upload/' + tid + '/' + filename
        #         file.save(saved_file)
        #         csv2jsonHC(saved_file)
        #         # reportdirname = create_report_dir(tid)
        #         # analyze_data(saved_file, 'report/' + tid + '/')
        #         # add_new_task(tid)
        #         return redirect(url_for('esxtop'))
        # return render_template('index.html')


if __name__ == '__main__':
     	app.debug = True
    	app.run(host="0.0.0.0", port=5001)



