module.exports = function(mongoose) {
	var Schema = mongoose.Schema;
	var models = {};
	
	//LOGIN SCHEMA
	var login = new Schema({
		priPhone: String,
		otp: String,
		createdAt: String
	});

	login.methods = {
		validateOtp: function(otp) {
			return (otp == this.otp);
		}
	};

	models.login = mongoose.model('Login', login);


	//ADDRESS SCHEMA
	var address = new Schema({
		priPhone: String,
		addressData: [{ nrn: String,
			name: String,
			addressLn1: String,
			addressLn2: String,
			zipCode: Number,
			fixedPhone1: String,
			fixedPhone2: String,
			mobilePhone1: String,
			mobilePhone2: String,
			x: Number,
			y: Number
		}]
	})

	models.address = mongoose.model('Address', address);

	return models;
}