const url = 'https://car-api2.p.rapidapi.com/api/models?make=Toyota&sort=id&direction=asc&year=2020&verbose=yes';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': 'e4b7473ce9msh3e68e8ae697e503p154e13jsn4edf2eb4d813',
		'x-rapidapi-host': 'car-api2.p.rapidapi.com'
	}
};

try {
  const response = await fetch(url, options);
  const result = await response.json();
  
  const carm = result.data.map(item => item.name);
  
  console.log(carm);
} catch (error) {
    console.error(error);
}
