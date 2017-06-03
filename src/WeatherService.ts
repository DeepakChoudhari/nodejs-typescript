import * as http from 'http';
import * as url from 'url';

class WeatherService {
    
    private currentWeatherApiUrl: string = 'http://api.apixu.com/v1/current.json?key=api-key&q=';

    private forecastWetherApiUrl: string = 'http://api.apixu.com/v1/forecast.json?key=api-key&q=';

    getWeatherInfo(city: string): Promise<string> {
        let parsedUrl = url.parse(`${this.currentWeatherApiUrl}${city}`);
        let httpReqOptions: any = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path
        };

        return new Promise<any>((resolve, reject) => {
            console.log(`Sending request to api - ${JSON.stringify(httpReqOptions, null, 4)}`);
            let request = http.get(httpReqOptions, response => {
                response.setEncoding('utf8');
                response.on('data', chunk => {
                    console.log(`Response from server - ${chunk}`);
                    resolve(chunk);
                });

                response.on('error', err => {
                    console.error(`Error in response - ${JSON.stringify(err, null, 4)}`);
                    reject(err.message);
                });
            });

            request.on('error', err => {
                console.error(`Error during request - \r\nStack Trace : ${err.stack}`);
                reject(err.message);
            });
            request.end();
        });
    }
}

export { WeatherService }