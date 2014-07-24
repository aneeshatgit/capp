module.exports = function(mongoose) {
	var Schema = mongoose.Schema;
	var models = {};
	
	//DEVICE SCHEMA 
	var regid = new Schema({
		rid: String,
		deviceType: {type: String, default: 'A'}
	});

	
	models.regid = mongoose.model('Regid', regid);

	
	var coordSchema = new Schema({lat: Number, lng: Number});

	//ALERT SCHEMA 
	var alert = new Schema({
		msg: String,
		count: {type: Number, default: 0},
		alertArea: [coordSchema]
	});

	
	models.alert = mongoose.model('Alerts', alert);



	return models;
}