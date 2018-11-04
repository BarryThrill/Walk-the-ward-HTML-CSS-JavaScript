Parse.initialize("vhsAtaDzRuFML4Movu78CiG1V6OSv1tYVhJdWMSW", "bkhWG2CWNnTUDqE3asOkGzNw1vrbBMyLy8YAUUgG");

$(function () {
    if ($("body").is($("#scanQR"))) {
        scanQR();
    }
});

var totalQuestions;

function getTotalQuestions() {
    var total = Parse.Object.extend("Total");
    var query = new Parse.Query(total);
    query.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[0];
                totalQuestions = object.get("totalQuestions");
            }
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
};
getTotalQuestions();

var modal = document.getElementById("myModal");
var gameQuestion;
var correct;
var alt2;
var alt3;
var alt4;
var lastQuestion;

var questionAmount = parseInt(localStorage.getItem("questionAmount"));
var correctAmount = parseInt(localStorage.getItem("correctAmount"));
var meter = parseInt(localStorage.getItem("meter"));
var lastStation = parseInt(localStorage.getItem("lastStation"));
var currentStation = parseInt(localStorage.getItem("currentStation"));

function updateMeter() {
     if (questionAmount != "0" & meter != "0") {
        $(".walked").text("Du har gått " + meter + " meter och du har " + correctAmount + "/" + questionAmount + " rätt");
    } else {
        $(".walked").text("Du har gått 0 meter och du har " + correctAmount + "/" + questionAmount + " rätt");
    }

}
function checkIfNaN() {
    questionAmount = questionAmount || 0;
    meter = meter || 0;
    correctAmount = correctAmount || 0;
    updateMeter();
}
checkIfNaN();

function scanQR() {
    $("#qr-canvas").WebCodeCam({
        ReadQRCode: true,
        ReadBarecode: true,
        width: 320,
        height: 240,
        flipVertical: false,
        flipHorizontal: false,
        // if zoom = -1, auto zoom for optimal resolution else int
        zoom: -1,
        // string, audio file location
        beep: "js/beep.mp3",
        // functional when value autoBrightnessValue is int
        autoBrightnessValue: false,
        brightness: 0,
        grayScale: false,
        contrast: 0,
        threshold: 0,
        // or matrix, example for sharpness ->  [0, -1, 0, -1, 5, -1, 0, -1, 0]
        sharpness: [],
        resultFunction: function (resText, lastImageSrc) {

            // resText as decoded code, lastImageSrc as image source

            //alert(resText);

            Parse.initialize("vhsAtaDzRuFML4Movu78CiG1V6OSv1tYVhJdWMSW", "bkhWG2CWNnTUDqE3asOkGzNw1vrbBMyLy8YAUUgG");

            var Category = Parse.Object.extend("Category");
            var query = new Parse.Query(Category);
            //query.equalTo("Sport"); // Endast om vi vill hämta specifik kategori
            query.include("question"); // För att inkludera allt i QR 
            //query.equalTo("qrId", result);
            query.find({
                success: function (results) {
                    for (var i = 0; i < results.length; i++) {
                        var object = results[i];
                        var question = object.get('question');
                        var qrId = question.get('qrId');

                        if (qrId == resText) {
                            //alert(object.get('category') + ' - ' + question.get('question'));
                            currentStation = question.get("locationNbr");

                            if (currentStation != lastStation) {
                                modal.style.display = "block";
                                $(".altBtn").prop("disabled", false);
                                compareStation();
                                questionAmount++;
                                gameQuestion = question.get("question");
                                correct = question.get("correct");
                                alt2 = question.get("optionTwo");
                                alt3 = question.get("optionThree");
                                alt4 = question.get("optionFour");
                                addInfo();
                            } else {
                                alert("Du har redan varit på denna station!");
                            }
                        }
                    }
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        }
    });
};

function compareStation() {
    if (lastStation == "100") {
        lastStation = currentStation;
    } else {
        var QREntity = Parse.Object.extend("QR");
        var qrEntity = new Parse.Query(QREntity);
        qrEntity.find({
            success: function (results) {
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    if (object.get("locationNbr") == currentStation) {
                        meter = meter + parseInt(object.get("distance" + lastStation));
                    }
                }
                lastStation = currentStation;
                localStorage.setItem("meter", meter);
                localStorage.setItem("lastStation", lastStation);
                localStorage.setItem("currentStation", currentStation);
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }
}

function addInfo() {
    var position = Math.floor((Math.random() * 4) + 1);
    $("#gameQuestion").text(gameQuestion);
    $("#alternative" + position).text(correct);

    if (position == 1) {
        $("#alternative" + (position + 1)).text(alt2);
        $("#alternative" + (position + 2)).text(alt4);
        $("#alternative" + (position + 3)).text(alt3);
    }
    if (position == 2) {
        $("#alternative" + (position - 1)).text(alt4);
        $("#alternative" + (position + 1)).text(alt2);
        $("#alternative" + (position + 2)).text(alt3);
    }
    if (position == 3) {
        $("#alternative" + (position - 2)).text(alt3);
        $("#alternative" + (position - 1)).text(alt4);
        $("#alternative" + (position + 1)).text(alt2);
    }
    if (position == 4) {
        $("#alternative" + (position - 3)).text(alt4);
        $("#alternative" + (position - 2)).text(alt3);
        $("#alternative" + (position - 1)).text(alt2);
    }
}

$(".altBtn").on("click", function () {
    $(".altBtn").prop("disabled", true);
    if ($(this).text() == correct) {
        $(this).css("background-color", "green");
        correctAmount++;
    } else {
        $(this).css("background-color", "red");
    }
    start();
    localStorage.setItem("questionAmount", questionAmount);
    localStorage.setItem("correctAmount", correctAmount);
    if (questionAmount == totalQuestions) {
        localStorage.setItem("questionAmount", questionAmount);
        localStorage.setItem("correctAmount", correctAmount);
        alert("Du har nu svarat på alla frågor! Du fick " + correctAmount + " rätt utav " + totalQuestions + "! Du gick " + meter + " meter! Tryck på börja om för att spela igen!");
    }
});

//Timer för fel/rätt gissning
var times = 0;
var interval = 0;

function start() {
    var delay = 1000;

    function end() {
        times += 1
        if (times > 1.5) {
            clearInterval(interval);
            $(".altBtn").css("background-color", "5bc0de");
            modal.style.display = "none";
            reset();
            updateMeter();
        }
    }
    interval = setInterval(end, delay);
}

function reset() {
    times = 0;
    interval = 0;
}

$(function () {
    if ($("body").is($("#station"))) {
        showStations();
    }
});

var station = $("#whatStation");

function showStations() {
    var Category = Parse.Object.extend("QR");
    var query = new Parse.Query(Category);
    query.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                var opt = document.createElement("option");
                opt.value = object.id;
                opt.innerHTML = object.get("locationNbr");
                $("#whatStation").append(opt);
            }
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}

$("#whatStation").on("change", function () {
    showDistances();
});

function showDistances() {
    var QREntity = Parse.Object.extend("QR");
    var qrEntity = new Parse.Query(QREntity);
    qrEntity.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                if (object.id == station.val()) {
                    if (object.get("distance1") != null) {
                        $("#dis1").text(object.get("distance1") + "m");
                    }
                    if (object.get("distance2") != null) {
                        $("#dis2").text(object.get("distance2") + "m");
                    }
                    if (object.get("distance3") != null) {
                        $("#dis3").text(object.get("distance3") + "m");
                    }
                    if (object.get("distance4") != null) {
                        $("#dis4").text(object.get("distance4") + "m");
                    }
                    if (object.get("distance5") != null) {
                        $("#dis5").text(object.get("distance5") + "m");
                    }
                    if (object.get("distance6") != null) {
                        $("#dis6").text(object.get("distance6") + "m");
                    }
                    if (object.get("distance7") != null) {
                        $("#dis7").text(object.get("distance7") + "m");
                    }
                    if (object.get("distance8") != null) {
                        $("#dis8").text(object.get("distance8") + "m");
                    }
                    if (object.get("distance9") != null) {
                        $("#dis9").text(object.get("distance9") + "m");
                    }
                    if (object.get("distance10") != null) {
                        $("#dis10").text(object.get("distance10") + "m");
                    }
                }
            }
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}

$("#restart").on("click", function () {
    meter = 0;
    questionAmount = 0;
    correctAmount = 0;
    lastStation = 100;
    currentStation = 0;
    localStorage.setItem("questionAmount", questionAmount);
    localStorage.setItem("correctAmount", correctAmount);
    localStorage.setItem("lastStation", lastStation);
    localStorage.setItem("currentStation", currentStation);
    localStorage.setItem("meter", meter);
    alert("Du har nu börjat om!");
    updateMeter();
});
