import './App.css';
import { LineChart, Line,  CartesianGrid, XAxis, YAxis, Tooltip, Legend  } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function App() {

  const [data, setData] = useState([])
  const [firstCountry, setFirstCountry] = useState('Brazil')
  const [secCountry, setSecCountry] = useState('Canada')
  const [countries, setCountries] = useState([])


  function csvJSON(csv) {
    let lines = csv.split("\n");
    let result = [];
    let headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
      let obj = {};
      let currentline = lines[i].split(",");
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return result;
  };

  function filterByCountry (arr, country) {
    console.log(arr, country)
    const releventArr = arr.filter(obj => obj['Country/Region'] === country)
    console.log(releventArr)
    let sumCountry = {"Country/Region" : country}
    releventArr.forEach(obj => {
      Object.keys(obj).forEach((key) => 
        key.includes('20') ?
        sumCountry[key] ?
        sumCountry[key] += parseInt(obj[key]) : sumCountry[key] = parseInt(obj[key]) : null
      ) 
    })
    return sumCountry
  }

    
  useEffect( () => {  
    const selectedCountries = [firstCountry, secCountry]
    async function fetchData () {
    const response = await axios.get('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
    const allCountriesData = csvJSON(response.data);
    console.log(allCountriesData)
    let allCountries = []
    allCountriesData.forEach(obj => allCountries.some(o => o === obj['Country/Region']) ? null : allCountries.push(obj['Country/Region']))
    setCountries(allCountries)
    console.log(countries)
    let dataToChart = []
    const filterData = selectedCountries.map(country =>filterByCountry(allCountriesData, country));
    console.log(filterData)
    Object.keys(filterData[0]).forEach((key)=>
      key.includes('20') ?
      dataToChart.push({
        date: key
    }) : null)
    dataToChart.forEach(obj =>
      filterData.forEach(obj1 => 
        obj[obj1['Country/Region']] = obj1[obj.date]
    ))
    
     setData(dataToChart)
     
   } 
   fetchData()
  }, [firstCountry, secCountry])
  


  return (
    <div className="App">
        <LineChart width={1000} height={500} data={data}>
          <Line type="monotone" dataKey={firstCountry} stroke="#000000"/>
          <Line type="monotone" dataKey={secCountry} stroke="#8884d8"/>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="date" />
          <YAxis/>
          <Tooltip/>
          <Legend />
        </LineChart>
        <div>
          Compare countries:
          <select onChange={e => setFirstCountry(e.target.value)} value={firstCountry}>
            {countries.map(country => <option>{country}</option>)}
          </select>
          <select onChange={e => setSecCountry(e.target.value)} value={secCountry}>
            {countries.map(country => <option>{country}</option>)}
          </select>
        </div>
    </div>
  );
}

export default App;
