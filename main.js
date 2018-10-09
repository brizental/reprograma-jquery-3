MINES = 40;
HEIGHT = 20;
WIDTH = 15;

function getUniqueRandomIndexesIn2DArray(table, indexes) {
    indexes = indexes ? indexes : [];
    for (var i = indexes.length; i < MINES; i++) {
        var random_cell = Math.floor(Math.random() * WIDTH); 
        var random_row = Math.floor(Math.random() * HEIGHT); 
        for (var j = 0; j < indexes.length; j++) {
            if (indexes[j][0] === random_cell &&
                indexes[j][1] === random_row) {
                return arguments.callee(table, indexes);
            }
        }
        indexes.push([random_row, random_cell]); // a criacao da tabela comeca pelo row e depois pelo cell (row tr = y | cell td = x) // ERRO 1
    }
    return indexes;
}

function getAdjacentCellIndexes(x, y) {
    return $.grep([
        [ x - 1, y - 1 ],
        [ x, y - 1 ],
        [ x + 1, y - 1 ],
        [ x - 1, y ],
        [ x + 1, y ],
        [ x - 1, y + 1 ],
        [ x, y + 1 ],
        [ x + 1, y + 1 ]
    ], function (element) {
        return element[0] >= 0 && element[1] >= 0 
            && element[0] < HEIGHT && element[1] < WIDTH // erro de digitacao do 0 e 1 | ordem y (height), x (width) // ERRO 2
    });
}

var field_matrix = [];
var field = $("#field table");
for (var i = 0; i < HEIGHT; i++) {
    var row_vector = [];
    var row = $("<tr>");
    for (var j = 0; j < WIDTH; j++) {
        var mine = $("<td>");
        mine.data("mines", 0);

        row.append(mine);
        row_vector.push(mine)
    }
    field.append(row);
    field_matrix.push(row_vector);
}
// CONSIDERAR QUE tr = y | td = x // ERRO 3 (valido para os proximos comentarios abaixo)
var mine_indexes = getUniqueRandomIndexesIn2DArray(field_matrix);
$.each(mine_indexes, function(index, coordinates) {
    var x = coordinates[1]; // CONSIDERAR QUE tr = y | td = x 
    var y = coordinates[0];
    var mine = $(field_matrix[y][x]);
    mine.addClass("mine");
});

$.each(mine_indexes, function (index, coordinates) {
    var adjacent_cells = getAdjacentCellIndexes(coordinates[0], coordinates[1]); // coordenadas alteradas pq sempre começamos pelo y e nao pelo x
    $.each(adjacent_cells, function(index, coordinates) {
        var x = coordinates[1];
        var y = coordinates[0];
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

$.each(field_matrix, function(index, row) {
    $.each(row, function(index, cell) {
        var number = $(cell).data("mines");
        if (number > 0) {
            $(cell).append(number);
        }
    });
});