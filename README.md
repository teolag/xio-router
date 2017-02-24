# xio-router
Simple javascript router


Router.goto('person/543');


<xio-route pattern="/person/:personId">
	<h1></h1>
</xio-route>


Router.addOnLoad("person", (view, params) => {
	console.log("Person page was loaded, personId:" + params.personId);
	const person = loadPerson(params.personId);
	view.querySelect('h1').textContent = person.name;
});