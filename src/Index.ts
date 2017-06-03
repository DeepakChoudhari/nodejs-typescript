import * as http from 'http';
import { WeatherService } from './weatherService';
import * as querystring from 'querystring';
import * as fs from 'fs';

enum FileType {
    FAVICON = 1,
    JS = 2,
    HTML = 3
};
let faviconFileBuf: Buffer = fs.readFileSync('favicon.ico');

class Main {
    public static Run() {        
        const port: number = 7700;
        const server: http.Server = http.createServer(Main.RequestListener);
        server.listen(port, function() {
        console.log(`Server listening on port ${port} - http://localhost:${port}/`);
            /*
            weatherSvc.getWeatherInfo('Chicago').then(response => {
            })
            .catch(error => {
            });
            */
        });
    }

    static RequestListener(request: http.IncomingMessage, response: http.ServerResponse) {
        Main.LogRequest(request);
            let fileType: FileType = FileType.HTML;

            if (request.url.includes('favicon.ico')) {
                fileType = FileType.FAVICON;
            }
            else if (request.url.includes('.html')) {
                fileType = FileType.HTML; 
            }
            else if (request.url.includes('.js')) {
                fileType = FileType.JS;
            }

            if (fileType) {
                Main.ServeStaticFiles(fileType, request, response);
            }
            else if (request.url.toLowerCase().includes('api/city')) {
                try {
                    Main.ProcessRequest(request, response);
                }
                catch(err)
                {
                    response.writeHead(500);
                    response.end(err);
                }
            }
            else {
                response.writeHead(400);
                response.end();
            }
    }

    static ServeStaticFiles(fileType: FileType, request: http.IncomingMessage, response: http.ServerResponse) {
        let urlSplit = request.url.split('/');
        let fileName = urlSplit[urlSplit.length - 1];
        let fileContent: Buffer;
        switch(fileType) {
            case FileType.FAVICON: 
                response.writeHead(200, { 'Content-Type': 'image/x-icon' });
                response.end(faviconFileBuf);
            break;
            case FileType.JS:
                fileContent = fs.readFileSync('scripts/' + fileName);
                response
            break;
            case FileType.HTML:
                fileContent = fs.readFileSync(fileName);
                response.writeHead(200, { 'Content-Type': 'text/html'});
                response.end(fileContent);
            break;
        }
    }

    static ProcessRequest(request: http.IncomingMessage, response: http.ServerResponse) {
        if (request.url.toLowerCase().includes('api/city')) {
            let urlSplit = request.url.split('/');
            if (urlSplit.length != 4) {
                throw new Error('Bad request');
            }

            let cityName = urlSplit[3];
            const weatherSvc = new WeatherService();
            weatherSvc.getWeatherInfo(cityName).then(value => {
                response.writeHead(200);
                response.end(value);
            }).catch(error => {
                console.error(`Error occurred calling weather service - ${error.stack}`);
                response.writeHead(500);
                response.end('Error occurred on the server.');
            });
        }
    }

    static LogRequest(request: http.IncomingMessage) {
        let requestLogMessage: RequestLog = {
                type: request.method,
                url: request.url,
                headers: request.headers
            };
        console.log(`[${new Date().toString()}]: ${JSON.stringify(requestLogMessage, null, 4)}`);
    }
}

interface RequestLog {
    type: string;
    url: string;
    headers: any;
}

Main.Run();