module.exports = function (schema) {
	return function (Model){
		Object.keys(schema.properties).forEach(function (property) {
			Model.attr(property);
		});
	};
};