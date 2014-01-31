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

	//VALIDATION SCHEMA 
	var validation = new Schema({
		phone: String,
		otp: String,
		createdAt: String
	});

	validation.methods = {
		validateOtp: function(otp) {
			return (otp == this.otp);
		}
	};

	models.validation = mongoose.model('Validation', validation);


	//ADDRESS SCHEMA
	var address = new Schema({
		priPhone: String,
		pendingPriPhone: String,
		nrn: String,
		name: String,
		addressData: [{ 
			addressName: String,
			googleAddress: String,
			streetNumber: String,
			route: String,
			locality: String,
			admAreaLevel1: String,
			postalCode: String,
			country: String,
			fixedPhone1: String,
			pendingFixedPhone1: String,
			fixedPhone2: String,
			pendingFixedPhone2: String,
			mobilePhone1: String,
			pendingMobilePhone1: String,
			mobilePhone2: String,
			pendingMobilePhone2: String,
			x: Number,
			y: Number
		}]
	})



	models.address = mongoose.model('Address', address);



	return models;
}