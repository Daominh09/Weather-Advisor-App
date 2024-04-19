import express  from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express()
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const apiWeatherKey = "YOUR KEY";



app.get('/', (req,res)=>{
    res.render('index.ejs')
})
app.post('/submit', async (req,res)=>{
    
    try{
        const geoResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?`, {
            params: {
                q: req.body.city,
                limit: 5,
                appid: apiWeatherKey
            }
        });
        const geoResult =  geoResponse.data;
        const latlon = {
            lat: geoResult[0].lat,
            lon: geoResult[0].lon,
        }
        console.log(latlon)
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather?', {
            params: {
                lat: latlon.lat,
                lon: latlon.lon,
                appid: apiWeatherKey
            }
        })
        const weatherResult = weatherResponse.data;
        console.log(weatherResult)
        
        let temperature = Math.floor(((weatherResult.main.temp - 273.15)*9)/5 + 32);
        let advise;
        
        if (temperature>=70&&(weatherResult.weather[0].main == 'Rain')){
            advise = 'You should bring your sunscream and umbrella.'
        }else if (temperature>=70){
            advise = "You should bring your suncream."
        }else if (weatherResult.weather[0].main == 'Rain'){
            advise = "You should bring your umbrella."
        }else if (temperature<30){
            advise = "It is really cold today!"
        }else {
            advise = "It is a wonderful day!"
        }

        res.render('index.ejs', {
            city: req.body.city,
            adviseSentence: advise,
            currentTemp: temperature,
            windspeed: weatherResult.wind.speed,
            status: weatherResult.weather[0].main,
            air: weatherResult.main.humidity
        })

    } catch(error) {
        res.render('index.ejs')
    }
})
app.listen(port, ()=>{
    console.log(`server listen on port ${port}`)
})
