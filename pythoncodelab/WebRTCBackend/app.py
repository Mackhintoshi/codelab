from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS extension

app = Flask(__name__)


CORS(app)


@app.after_request
def after_request(response):
    """
    This method will check the headers and perform security check

    :param response: Flask response object
    """
    #allow all
    white_origin= ['http://127.0.0.1:3000','http://localhost','http://localhost:3000',"null","https://codelab-eight.vercel.app"]
    if 'HTTP_ORIGIN' in request.environ and request.environ['HTTP_ORIGIN']  in white_origin:
        response.headers['Access-Control-Allow-Origin'] = request.headers['Origin']
        response.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
        response.headers['Access-Control-Allow-Headers'] = 'Cookie,Content-Type,Authorization,Accept,Accept-encoding,Accept-Language,Cache-Control,Connection,DNT,Host,Se-Fetch-Dest,Sec-Fetch-Mode,Sec-Fetch-Site,User-Agent'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        
    return response


# Dictionary to store room data
rooms = {}


@app.route('/api/room', methods=['PUT'])
def create_or_update_room():
    # Get data from the request payload
    data = request.get_json()

    #if there are more than 20 rooms, delete the first one in order to keep the memory usage low as this is just a demo
    if len(rooms) > 20:
        rooms.popitem(last=False)
    # Check if 'room_name' and 'sdp_text' are provided in the request
    if 'room_name' in data and 'host_sdp_text' in data and 'host' in data:
        room_name = data['room_name']
        sdp_text = data['host_sdp_text']
        host = data['host']

        # Store the room data in the dictionary
        rooms[room_name] = {}
        rooms[room_name]['host_sdp_text'] = sdp_text
        rooms[room_name]['host'] = host

        return jsonify({"message": f"Room '{room_name}' created/updated successfully."}), 201
    else:
        return jsonify({"error": "Invalid request. Please provide 'room_name' and 'sdp_text' in the request payload."}), 400


@app.route('/api/room/join', methods=['POST'])
def join_room():
    #updates the room with the guest sdp
    data = request.get_json()
    try:
        if 'guest_sdp_text' in data and 'guest' in data and 'room_name' in data:
            room_name = data['room_name']
            if(room_name not in rooms):
                return jsonify({"error": f"Room '{room_name}' does not exist."}), 404
            rooms[room_name]['guest_sdp_text'] = data['guest_sdp_text']
            rooms[room_name]['guest'] = data['guest']
            #todo websocket
            return jsonify({"message": f"Room '{room_name}' joined successfully."}), 200
        else:
            return jsonify({"error": "Invalid request. Please provide 'guest_sdp_text' in the request payload."}), 400
    except KeyError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        

@app.route('/api/room/<string:room_name>', methods=['GET'])
def get_room(room_name):
    # Check if the room exists in the dictionary
    if room_name in rooms:
        return jsonify(rooms[room_name]), 200
    else:
        return jsonify({"error": f"Room '{room_name}' does not exist."}), 404
if __name__ == '__main__':
    app.run(debug=True,port=5002)


@app.route('/api/room/<string:room_name>', methods=['POST'])
def update_room(room_name):
    #dynamic update the room with the new values
    data = request.get_json()
    if 'host_sdp_text' in data:
        rooms[room_name]['host_sdp_text'] = data['host_sdp_text']
    if 'guest_sdp_text' in data:
        rooms[room_name]['guest_sdp_text'] = data['guest_sdp_text']
    if 'host' in data:
        rooms[room_name]['host'] = data['host']
    if 'guest' in data:
        rooms[room_name]['guest'] = data['guest']

    #todo websocket
    return jsonify({"message": f"Room '{room_name}' updated successfully."}), 200




if __name__ == '__main__':
    app.run(debug=True,port=5002)