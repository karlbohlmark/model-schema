

module.exports = function (schema, constructors) {
	function getValue(propertySchema, value) {
		if (propertySchema.type && propertySchema.type.$ref) {
			return new constructors[propertySchema.type.$ref](value);
		}

		({
			'array': function () {
				return value.map(function (item) {
					return getValue(propertySchema.items, item);
				});
			},
			'object': function () {
				if (!propertySchema.properties) {
					return value;
				} else {
					var o = {};
					Object.keys(propertySchema.properties).forEach(function (property){
						o[property] = getValue(propertySchema.properties[property], value[property]);
					});
					return o;
				}
			},
			'string': function () {
				return value;
			}
		})[propertySchema.type]();
	}

	return function (Model){
		Object.keys(schema.properties).forEach(function (property) {
			Model.attr(property);
		});

		var setFn = function (instance) {
			return function (attrs) {
				Object.keys(attrs).forEach(function (property) {
					instance[property]( getValue(schema.properties[property], attrs[property]) );
				});
			};
		};

		Model.on('construct', function (instance) {
			setFn(instance)(instance.attrs);
		});

		Model.prototype.set = function (attrs) {
			setFn(this)(attrs);
		};
	};
};