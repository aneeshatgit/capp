exports.smser = function(numbers, message){
	var soap = require('soap');
	var params = require("../config/config-params");
	var url = params.smsWsdl;
	var args = {umsCompany: params.umsCompany,
				umsDepartment: params.umsDepartment,
				umsPassword: params.umsPassword,
				to: numbers,
				from: params.smsfrom,
				text: message}
	soap.createClient(url, function(err, client) {
	  client.doSendSMSSimple(args, function(err, result) {
	      if(err) {
	      	console.log(err);
	      }
	      console.log(result);
       	  //res.send({status: true});
	  });
	});
}
exports.voice = function(numbers, message){
	var soap = require('soap');
	var params = require("../config/config-params");
	var url = params.vw;
	var args = {
		account: {
			Company: params.voiceCompany,
			Department: params.voiceDepartment,
			Password: params.voicePassword,
		}, 
		settings: {
			SendingName: params.sendingName,
			MessageCaching: 0,
			Profile: {
				Name: params.profileName
			},
			ConfigProfile: {
				Name: params.configProfileName
			},
			Schedule: 0,
			HiddenNumber: 0
		},
		to: {
			RECIPIENT: [{
				PhoneNumber: numbers
			}]
		},
		from: params.from,
		messages: {
			ArrayOfVOCFILE: [{
				VOCFILE: [{
					type: "TTS",
					sz_tts_string: message,
					l_langpk: "BRITISH",
				}]
			}]
		}
	}
	soap.createClient(url, function(err, client) {
	  client.sendVoice(args, function(err, result) {
	      if(err) {
	      	console.log(err);
	      }
	      console.log(result);
       	  //res.send({status: true});
	  });
	});
}
