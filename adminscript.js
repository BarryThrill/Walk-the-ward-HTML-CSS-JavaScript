Parse.initialize("vhsAtaDzRuFML4Movu78CiG1V6OSv1tYVhJdWMSW", "bkhWG2CWNnTUDqE3asOkGzNw1vrbBMyLy8YAUUgG");

$("#login").on("click", function () {
    Parse.User.logIn($("#userName").val(), $("#pass").val(), {
        //Parse.User.logIn("admin", "admin", {
        success: function (user) {
            // Allt gick bra, skicka vidare användare
            window.location.href = "admin.html";
        },
        error: function (user, error) {
            alert("Ditt användarnamn eller lösenord stämmer inte");
            $("#userName").text("");
            $("#password").text("");
            // Något gick fel, visa error
        }
    });
});


var select = $("#category");

//Funktion för att hämta alla kategorier från databasen, dessa visas i listan när man ska skapa frågor
function getCategories() {
    var Category = Parse.Object.extend("Category");
    var query = new Parse.Query(Category);
    var exist = false;
    query.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                exist = false;
                var object = results[i];

                //Går igenom existerande options i select och lägger boolean true om den hämtade object redan finns som option.
                $("#category option").each(function (i) {
                    if ($(this).text() == object.get("category")) {
                        exist = true;
                    }
                });
                //Om den hämtade object inte finns som option, lägg till.
                if (!exist) {
                    var opt = document.createElement("option");
                    opt.value = object.get("category");
                    opt.innerHTML = object.get("category");
                    $("#category").append(opt);
                }
            }
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}
//Om sidan är newQuestion.html så anropa getCategories
$(function () {
    if ($("body").is($("#newQuestionPage"))) {
        getCategories();
    }
});


//Funktion för att spara en ny fråga/kategori
$("#saveQuestion").on("click", function () {
    var QREntity = Parse.Object.extend("QR");
    var qrEntity = new QREntity();
    qrEntity.set("question", $("#newQuestion").val());
    qrEntity.set("correct", $("#correctAnswer").val());
    qrEntity.set("optionTwo", $("#alt2").val());
    qrEntity.set("optionThree", $("#alt3").val());
    qrEntity.set("optionFour", $("#alt4").val());
    qrEntity.set("locationNbr", parseInt($("#locationNbr").val()));
    qrEntity.set("qrId", $("#qrId").val());

    qrEntity.save({
        success: function (qrEntity) {
            // Skapa en kategori
            addCategoryWithQuestion();
        },
        error: function (qrEntity, error) {
            // Något gick fel, felmeddelande här
            console.log(error);

        }
    });

    function addCategoryWithQuestion() {
        var CatEntity = Parse.Object.extend("Category");
        var catEntity = new CatEntity();

        if (select.val() == "new") {
            catEntity.set("category", $("#newCategory").val());
        } else {
            catEntity.set("category", select.val());
        }
        catEntity.set("question", qrEntity);

        catEntity.save({
            success: function (catEntity) {
                // Visa att allt gick bra, popup fönster tex? Laddar om sidan efteråt
                alert("Allt gick bra! Frågan skapades");
                location.reload();
            },
            error: function (catEntity, error) {
                // Något gick fel, felmeddelande här
                console.log(error);
            }
        });
    }
});


//Funktion för att hämta alla frågor för redigering
function removeQuestion() {
    var Category = Parse.Object.extend("Category");
    var query = new Parse.Query(Category);
    //query.equalTo("Sport"); // Endast om vi vill hämta specifik kategori
    query.include("question"); // För att inkludera allt i QR 
    query.find({
        success: function (results) {
            //alert("Successfully retrieved " + results.length);
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                var question = object.get("question");
                //Hämtar ID för Category som frågan är kopplad till
                var categoryID = object.id;
                //Hämtar ID för QR där frågan finns.
                var questionID = question.id;

                //alert(object.get('category') + ' - ' + question.get('question'));

                $("<div></div>").attr("id", "edit" + i).addClass("col-xs-12 col-sm-12 editQuestion").appendTo($("#editPanel"));
                $("<p>" + question.get("question") + "</p>").addClass("question").appendTo($("#edit" + i));
                $("<p>" + question.get("correct") + "</p>").appendTo($("#edit" + i));
                $("<p>" + question.get("optionTwo") + "</p>").appendTo($("#edit" + i));
                $("<p>" + question.get("optionThree") + "</p>").appendTo($("#edit" + i));
                $("<p>" + question.get("optionFour") + "</p>").appendTo($("#edit" + i));
                $("<button>Ta bort frågan </button>").val(categoryID + "," + questionID).appendTo($("#edit" + i)).on("click", function () {
                    var id = $(this).val();
                    var splitID = id.split(",")
                        //splitID[0] = categoryID
                        //splitID[1] = questionID
                    deleteFromDatabase(splitID[0], splitID[1]);
                });
            }
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}
//Om sidan är editQuestion.html så anropa removeQuestion
$(function () {
    if ($("body").is($("#editQuestionPage"))) {
        removeQuestion();
    }
});

function deleteFromDatabase(categoryID, questionID) {
    //console.log(categoryID + " - " + questionID);

    var question = Parse.Object.extend("QR");
    var query = new Parse.Query(question);
    query.get(questionID, {
        success: function (myObj) {
            // The object was retrieved successfully.
            myObj.destroy({});
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
        }
    });

    var category = Parse.Object.extend("Category");
    var query2 = new Parse.Query(category);
    query2.get(categoryID, {
        success: function (myObj) {
            // The object was retrieved successfully.
            myObj.destroy({});
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
        }
    });
    alert("Frågan är nu borttaget!");
    location.reload();
}


var distance = $("#distance");
//Funktion för att hämta alla frågor från databasen, dessa visas i listan när man ska lägga till distanser
function distances() {
    var question = Parse.Object.extend("QR");
    var query = new Parse.Query(question);
    query.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                var opt = document.createElement("option");
                opt.value = object.id;
                opt.innerHTML = object.get("locationNbr") + " - " + object.get("question");
                $("#distance").append(opt);
            }
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}

//Om sidan är distance.html så anropa distances
$(function () {
    if ($("body").is($("#addDistances"))) {
        distances();
    }
});

$("#saveDistances").on("click", function () {
    //query.equalTo("objectId", distance.val());
    //console.log(distance.val());
    var QREntity = Parse.Object.extend("QR");
    var qrEntity = new Parse.Query(QREntity);
    //qrEntity.equalTo("objectId", distance.val());
    qrEntity.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                if (object.id == distance.val()) {
                    object.set("distance1", parseInt(document.getElementById("distance1").value));
                    object.set("distance2", parseInt(document.getElementById("distance2").value));
                    object.set("distance3", parseInt(document.getElementById("distance3").value));
                    object.set("distance4", parseInt(document.getElementById("distance4").value));
                    object.set("distance5", parseInt(document.getElementById("distance6").value));
                    object.set("distance6", parseInt(document.getElementById("distance6").value));
                    object.set("distance7", parseInt(document.getElementById("distance7").value));
                    object.set("distance8", parseInt(document.getElementById("distance8").value));
                    object.set("distance9", parseInt(document.getElementById("distance9").value));
                    object.set("distance10", parseInt(document.getElementById("distance10").value));
                    object.save();
                    alert("Distanserna är nu sparade!");
                    location.reload();
                }
            }
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
});

$("#saveTotalQuestions").on("click", function () {
    var totalQuestions = Parse.Object.extend("Total");
    var query = new Parse.Query(totalQuestions);
    var total = new totalQuestions();
    query.find({
        success: function (results) {
            //alert("Successfully retrieved " + results.length);
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                object.destroy();
            }
            total.set("totalQuestions", parseInt($("#totalQuestions").val()));
            total.save({
                success: function (qrEntity) {
                    alert("Antal frågor är nu sparad!");
                    location.reload();
                },
                error: function (qrEntity, error) {
                    // Något gick fel, felmeddelande här
                    console.log(error);
                }
            });
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
});
