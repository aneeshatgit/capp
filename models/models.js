module.exports = function(mongoose) {
	var Schema = mongoose.Schema;
	var models = {};
	
	//PLAN SCHEMA 
	var plan = new Schema({
		planName: String,
		shapeList: [{
			shapeName: String,
			coordinates: [{
				x: Number,
				y: Number
			}]
		}],
		readerList: [{ type: String, ref: 'Reader' }]
	});

	
	models.plan = mongoose.model('Plan', plan);

	//READER SCHEMA 
	var reader = new Schema({
		readerName: String,
		readerMacId: String,
		readerPositionX: String,
		readerPositionY: String,
		containingPlan: { type: String, ref: 'Plan' }
	});


	models.reader = mongoose.model('Reader', reader);

	return models;
}