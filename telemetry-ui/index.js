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
    arduino_baudrate = 9600;

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
    arduino_parser = arduino_port.pipe(new Readline({delimiter: '\r\n'}));
    arduino_parser.on('data', (data) => {
        let now = new Date();
        io.sockets.emit('data', 
            {
                data: data,
                utc: now.getTime(),
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
                data: (Math.random() * variance) + mean,
                utc: now.getTime(),
            }
        );
    }, interval);
}

var server = app.listen(webport, () => {
    console.log('Starting...');
    
    try {
        // Find portname
        arduino_portname = find_arduino_port();

        if(arduino_portname){
            // Open port
            arduino_port = SerialPort(arduino_portname, {baudrate: arduino_baudrate});
            // Listen for data from arduino
            emit_arduino_data(arduino_port)
                .catch(err => { throw Error(err) });
        } else if(mock_arduino){
            // If no arduino found and mock-arduino selected, emit random data
            emit_random_data(25, 1, 80)
                .catch(err => { throw Error(err) });
        } else {
            // Else fail fast
            throw Error('No Arduino Found.');
        }

        console.log('Server started up successfully.');

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