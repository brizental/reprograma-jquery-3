// DEFAULT MINES
MINES = 40;
HEIGHT = 16;
WIDTH = 16;

//BEGINNER LEVEL
MINESBEGINNER = 10;
WIDTHBEGINNER = 8;
HEIGHTBEGINNER = 8;

//INTERMEDIATE LEVEL
MINESINTERMEDIATE = 40;
WIDTHINTERMEDIATE = 16,
HEIGHTINTERMEDIATE = 16;

//EXPERT LEVEL
MINESEXPERT = 99;
WIDTHEXPERT = 24;
HEIGHTEXPERT = 24

TIMER = false;

NAME = prompt("Insira seu nome", "Ex. Matilda");

//ADIÇÃO DE EVENTO DE CLICK NO BOTÃO COM MUDANÇA DE CLASSES 
var button = $(".level-button");
button.click(function (event) {
    event.preventDefault();
    $(".level-options").toggle()
})

//ADIÇÃO DAS OPÇÕES DE NÍVEIS COM OS CLICKS
var beginnerButton = $(".level-options__beginner");
var intermediateButton = $(".level-options__intermediate");
var expertButton = $(".level-options__expert");

beginnerButton.click(function () {
    $("tr").remove();
    //MUDA VALOR ANTES DE CRIAR NOVO TABULEIRO
    WIDTH = WIDTHBEGINNER;
    MINES = MINESBEGINNER;
    HEIGHT = HEIGHTBEGINNER;
    criarTabela();
})
intermediateButton.click(function () {
    $("tr").remove();
    WIDTH = WIDTHINTERMEDIATE;
    MINES = MINESINTERMEDIATE;
    HEIGHT = HEIGHTINTERMEDIATE;
    criarTabela();
})
expertButton.click(function () {
    $("tr").remove();
    WIDTH = WIDTHEXPERT;
    MINES = MINESEXPERT;
    HEIGHT = HEIGHTEXPERT;
    criarTabela();
})

function getUniqueRandomIndexesIn2DArray(table, indexes) {
    indexes = indexes ? indexes : [];
    for (var i = indexes.length; i < MINES; i++) {
        var random_cell = Math.floor(Math.random() * WIDTH);
        var random_row = Math.floor(Math.random() * HEIGHT);
        for (var j = 0; j < indexes.length; j++) {
            if (indexes[j][0] === random_cell &&
                indexes[j][1] === random_row) {
                return getUniqueRandomIndexesIn2DArray(table, indexes);
            }
        }
        indexes.push([random_cell, random_row]); // a criacao da tabela comeca pelo row e depois pelo cell (row tr = y | cell td = x) // ERRO 1
    }
    console.log(indexes)
    return indexes;
}

function getAdjacentCellIndexes(x, y) {
    return $.grep([
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],
        [x - 1, y],
        [x + 1, y],
        [x - 1, y + 1],
        [x, y + 1],
        [x + 1, y + 1]
    ], function (element) {
        return element[0] >= 0 && element[1] >= 0
            && element[0] < WIDTH && element[1] < HEIGHT // erro de digitacao do 0 e 1 | ordem y (height), x (width) // ERRO 2
    });
}

function criarTabela() {
    var field_matrix = [];
    var field = $("#field table");
    var counter = 0;
    for (var i = 0; i < HEIGHT; i++) {
        var row_vector = [];
        var row = $("<tr>");
        for (var j = 0; j < WIDTH; j++) {
            var mine = $("<td>");
            mine.data("mines", 0);

            var button = $("<div>");
            button.addClass("button");
            button.data("coordinates", [j, i]);

            button.contextmenu(function () {
                return false;
            });

            button.mousedown(function (event) {
                if (!TIMER) {
                    TIMER = setInterval(function () {
                        counter++;
                        $("#timer").text(counter);
                    }, 1000);
                }
                if (event.which === 3) {
                    $(this).toggleClass("red-flag");
                    $("#mines").text($(".red-flag").length);
                } else {
                    $("#reset").addClass("wow");
                }
            });

            button.mouseup(function () {
                $("#reset").removeClass("wow");
                if (!$(this).hasClass("red-flag")) {
                    if ($(this).parent().hasClass("mine")) {
                        $("td .button").each(function (index, button) {
                            button.remove();
                        })
                        $("#reset").addClass("game-over");
                        clearInterval(TIMER);
                    } else if ($(this).parent().data("mines") > 0) {
                        $(this).remove();
                    } else if ($(this).parent().data("mines") === 0) {
                        var coordinates = $(this).data("coordinates");
                        $(this).remove();
                        (function (x, y) {
                            var adjacent_cells = getAdjacentCellIndexes(x, y);
                            for (var k = 0; k < adjacent_cells.length; k++) {
                                var x = adjacent_cells[k][0];
                                var y = adjacent_cells[k][1];
                                var cell = $(field_matrix[y][x]);
                                var button = cell.children($(".button"));
                                if (button.length > 0) {
                                    button.remove();
                                    if (cell.data("mines") === 0) {
                                        arguments.callee(x, y);
                                    }
                                }
                            }
                        })(coordinates[0], coordinates[1]);
                    }

                    if ($("td .button").length === MINES) {
                        $("#reset").addClass("winner");
                        clearInterval(TIMER);

                        $.ajax({
                            method: "POST",
                            url: "https://campo-minado.herokuapp.com/save",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify({
                                timestamp: Date.now(),
                                name: NAME,
                                score: counter,
                            })
                        })
                            .done(function (data) {
                                console.log("data", data);
                            })
                            .catch(function (error) {
                                console.log("error", error);
                            })
                    }
                }
            })

            mine.append(button);

            row.append(mine);
            row_vector.push(mine)
        }
        field.append(row);
        field_matrix.push(row_vector);
    }
    // CONSIDERAR QUE tr = y | td = x // ERRO 3 (valido para os proximos comentarios abaixo)
    var mine_indexes = getUniqueRandomIndexesIn2DArray(field_matrix);
    $.each(mine_indexes, function (index, coordinates) {
        var x = coordinates[0]; // CONSIDERAR QUE tr = y | td = x 
        var y = coordinates[1];
        var mine = $(field_matrix[y][x]);
        mine.addClass("mine");
    });

    $.each(mine_indexes, function (index, coordinates) {
        var adjacent_cells = getAdjacentCellIndexes(coordinates[0], coordinates[1]); // coordenadas alteradas pq sempre começamos pelo y e nao pelo x
        $.each(adjacent_cells, function (index, coordinates) {
            var x = coordinates[0];
            var y = coordinates[1];
            var cell = $(field_matrix[y][x]);
            if (!cell.hasClass("mine")) {
                var num_mines = cell.data("mines") + 1;
                cell.data("mines", num_mines);
                switch (num_mines) {
                    case 1:
                        cell.css("color", "blue");
                        break;
                    case 2:
                        cell.css("color", "green");
                        break;
                    case 3:
                        cell.css("color", "red");
                        break;
                    case 4:
                        cell.css("color", "navy");
                        break;
                    case 5:
                        cell.css("color", "maroon");
                        break;
                    case 6:
                        cell.css("color", "teal");
                        break;
                    case 7:
                        cell.css("color", "DarkMagenta");
                        break;
                    case 8:
                        cell.css("color", "black");
                        break;
                }
            }
        })
    });

    $.each(field_matrix, function (index, row) {
        $.each(row, function (index, cell) {
            var number = $(cell).data("mines");
            if (number > 0) {
                $(cell).append(number);
            }
        });
    });
}

criarTabela();

//quando clicar no botão reset a tabela preenchida é removida e é criada uma tabela nova
$("#reset").click(function () {
    $("tr").remove();
    criarTabela();

    //altera o background do botão reset
    $(this).removeClass("game-over winner wow");

    //apaga a quantidande de minas quando o botão reset é clicado   
    $("#mines").html("");

    //reinicia o tempo quando o botão reset é clicado    
    clearInterval(TIMER);
    TIMER = false;
    $("#timer").text(" ");
})