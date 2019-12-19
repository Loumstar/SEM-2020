'use strict'

const express = require('express'),
      SerialPort = require('serialport'),
      Readline = SerialPort.parsers.Readline,
      app = express();

const mock_arduino = process.argv.indexOf('mock-arduino') >= 0;

var webport = 3000,
    arduino_parser,
    arduino_port,
    arduino_portname,
    arduino_baudrate = 9600,
    count = 0;

// Serve single HTML page that will display all telemetry.
app.use(express.static('public'));

// Serve d3.min.js.
app.use('/d3', express.static(`${__dirname}/node_modules/d3/dist`));

const find_arduino_port = () => {
    if(!mock_arduino){
        SerialPort.list((err, ports) => {
            if (err) throw Error(err);

            ports.forEach((p) => {
                if(p.manufacturer == 'Arduino (www.arduino.cc)'){
                    console.log('Arduino identified:');
                    console.log(p);
                    return p.comName;
                }
            });
        });
    }
    return null;
}

const emit_arduino_data = async (arduino_port) => {
    // Method to send data through socket from arduino.
    arduino_parser = arduino_port.pipe(new Readline({delimiter: '\n'}));
    arduino_parser.on('data', (data) => {
        console.log(data)
        let arr = data.split("\t");
        console.log(arr[0]);
        arr[1] = parseInt(arr[1], 10);
        arr[2] = parseInt(arr[2]);
        arr[3] = parseInt(arr[3]);
        console.log(arr[1]);
        console.log(arr[2]);
        console.log(arr[3]);
        io.sockets.emit('data',
            {
                id: arr[1],
                data: arr[2],
                utc: arr[3],
            }
        );
    })
}

const emit_random_data = async (mean, variance, interval) => {
    // Method to send random data through socket for testing without an arduino
    setInterval(() => {
        let now = new Date();
        io.sockets.emit('data',
            {
                id: Math.round(Math.random() * 4),
                data: (Math.random() * variance) + mean,
                utc: count++,
            }
        );
    }, interval);
}

var server = app.listen(webport, () => {
    console.log('Starting...');
    try {
        // Connect to a serial port or start a mock arduino service
        if(!mock_arduino){
            // If no arduino found and mock-arduino selected, emit random data
            console.log("Running mock arduino");
            emit_random_data(25, 10, 80)
                .catch(err => { throw Error(err) });
        } else {
          // Open port
          serialPort = '/dev/cu.SLAB_USBtoUART';
          arduino_port = SerialPort(serialPort, {baudRate: arduino_baudrate});
          // Listen for data from arduino
          emit_arduino_data(arduino_port)
              .catch(err => { throw Error(err) });
        }

        console.log('Server started up successfully at http://localhost:3000/');

    } catch(err) {
        console.error(err);
        console.log('Exiting...');

        process.exit(1);
    }
})

var io = require('socket.io')(server);

io.on('connection', () => {
    console.log('A new client has connected to the server.');
})
