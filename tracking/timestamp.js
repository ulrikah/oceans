function bang() {
   var myDate = new Date();
   outlet(0, myDate.getTime()) // will send out the unix time in milliseconds when receiving a bang
}