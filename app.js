class DSU {
  constructor(n){
    this.parents = [];
    for (var i = 0; i < n; i++) this.parents[i] = i;
  }

  find(x){
    if (this.parents[x] != x)
      this.parents[x] = this.find(this.parents[x]);
    return this.parents[x];
  }

  union(x, y){
    this.parents[this.find(x)] = this.find(y);
  }
};

var shuffle_array = function(arr){
  for (let i = arr.length-1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
};

var array_2d = function(height, width, elem){
  var arr = [];
  for (var i = 0; i < height; i++){
    arr[i] = [];
    for (var j = 0; j < width; j++)
      arr[i][j] = elem;
  }
  return arr;
};

var longest_path = function(grid, inside, x, y){
  var inf = grid.length * grid[0].length;
  var distance = array_2d(grid.length, grid[0].length, inf);
  distance[x][y] = 0;

  var dx = [-1, 1, 0, 0];
  var dy = [0, 0, -1, 1];

  var q_now = [[x, y]];
  while (true) {
    var q_next = [], qn = 0;
    for (var i = 0; i < q_now.length; i++) {
      var px = q_now[i][0], py = q_now[i][1];
      for (var mv = 0; mv < 4; mv++) {
        var qx = px + dx[mv], qy = py + dy[mv];
        if (!inside(qx, qy)) continue;
        if (!grid[qx][qy]) continue;
        if (distance[qx][qy] < inf) continue;
        distance[qx][qy] = distance[px][py] + 1;
        q_next[qn++] = [qx, qy];
      }
    }
    if (q_next.length == 0) break;
    q_now = q_next;
    q_next = [];
  }

  var best_xy = [x, y], best_xy_distance = 0;
  for (var i = 0; i < grid.length; i++)
    for (var j = 0; j < grid[i].length; j++)
      if ((grid[i][j]) && (distance[i][j] > best_xy_distance)) {
        best_xy = [i, j];
        best_xy_distance = distance[i][j];
      }
  return [best_xy, best_xy_distance];
};

var prepare_maze = function(difficulty){
  var parameters = [
    [17, 11],
    [23, 15],
    [37, 23],
    [59, 37],
    [93, 59],
    [127, 79],
  ];
  var width = parameters[difficulty][0];
  var height = parameters[difficulty][1];

  var grid = array_2d(height, width, false);

  var inside = function(x, y){
    return (x > 1) && (x < height-2) && (y > 1) && (y < width-2);
  };

  var edges = [];
  var ec = 0;
  for (var i = 0; i < height; i++)
    for (var j = 0; j < width; j++)
      if (((i % 2 == 1) ^ (j % 2 == 1)) && (inside(i, j))){
        edges[ec] = [i, j];
        ec++;
      }
  shuffle_array(edges);

  for (var i = 0; i < height; i++)
    for (var j = 0; j < width; j++)
      if ((i % 2 == 0) && (j % 2 == 0) && (inside(i, j)))
       grid[i][j] = true;

  var edge_id = function(x, y){
    return x * width + y;
  };
  var dsu = new DSU(width * height);
  for (var i = 0; i < edges.length; i++){
    var edge = edges[i];
    var v1 = [Math.floor(edge[0] / 2) * 2, Math.floor(edge[1] / 2) * 2];
    var v2 = [Math.floor((edge[0] + 1) / 2) * 2, Math.floor((edge[1] + 1) / 2) * 2];
    if (dsu.find(edge_id(v1[0], v1[1])) != dsu.find(edge_id(v2[0], v2[1]))){
      dsu.union(edge_id(v1[0], v1[1]), edge_id(v2[0], v2[1]));
      grid[edge[0]][edge[1]] = true;
    }
  }

  var lpr_1 = longest_path(grid, inside, 2, 2);
  var lpr_2 = longest_path(grid, inside, lpr_1[0][0], lpr_1[0][1]);

  return [grid, lpr_1[0], lpr_2[0]];
};

var time_format = function(seconds) {
  var two_digit = function(x){
    if (x < 10) return "0" + x;
    return x;
  };
  if (seconds < 60) return seconds + " s";
  if (seconds < 3600)
    return Math.floor(seconds / 60) + " min " + two_digit(seconds % 60) + " s";
  return Math.floor(seconds / 3600) + " h " +
         two_digit(Math.floor(seconds / 60) % 60) + " min " +
         two_digit(seconds % 60) + " s";
};

var maze = function(result_pane, board_pane, difficulty){
  var maze_obj = prepare_maze(difficulty);
  var grid = maze_obj[0];
  var start_pos = maze_obj[1];
  var exit_pos = maze_obj[2];

  board_pane.html('');

  var center_obj = $('<div>', {
    'class': 'center_obj'
  });
  board_pane.append(center_obj);

  var grid_pane = $('<table>', {
    'class': 'grid'
  });
  center_obj.append(grid_pane);

  var n = Math.floor(grid.length / 2) - 1;
  var m = Math.floor(grid[0].length / 2) - 1;

  var resolution = [ board_pane.height(), board_pane.width() ];
  var grid_cell_height = (resolution[0] - 60 - (n - 1) * 5) / n;
  var grid_cell_width = (resolution[1] - 60 - (m - 1) * 5) / m;
  var grid_size = Math.floor(Math.min(grid_cell_height, grid_cell_width));

  var class_name = function(index, length){
    if (index == 0) return 'first';
    if (index == length-1) return 'last';
    if (index % 2 == 0) return 'even';
    return 'odd';
  };

  var grid_objects = array_2d(grid.length, grid[0].length, null);

  var inside = function(x, y){
    return (x > 1) && (x < grid.length-2) && (y > 1) && (y < grid[0].length-2);
  };

  var player_pos = start_pos;
  var won_game = false;

  var stopwatch = 0;
  result_pane.html(time_format(stopwatch));
  var increase_stopwatch = function(){
    stopwatch++;
    result_pane.html(time_format(stopwatch));
  }
  var increase_stopwatch_handle = setInterval(increase_stopwatch, 1000);

  var issue_move = function(px, py, dmx, dmy){
    console.log(dmx, dmy);
    if ((dmx * dmx + dmy * dmy != 1)) return [px, py];
    var qx = px, qy = py;
    grid_objects[px][py].removeClass('active_cell');
    for (var i = 0; i < 2; i++) {
      qx += dmx;
      qy += dmy;
      if (!inside(qx, qy)) { qx = px; qy = py; }
      if (!grid[qx][qy]) { qx = px; qy = py; }
      grid_objects[qx][qy].addClass('visited_cell');
    }
    grid_objects[qx][qy].addClass('active_cell');
    player_pos = [qx, qy];
    if ((player_pos[0] == exit_pos[0]) && (player_pos[1] == exit_pos[1])) {
      var sz = Math.min(Math.floor(result_pane.height() / 3), Math.floor(result_pane.width() / 3));
      result_pane.html(time_format(stopwatch) + '&nbsp;&nbsp;<img src="success.png" width="' + sz + '" height="' + sz + '">');
      clearInterval(increase_stopwatch_handle);
      won_game = true;
    }
    return [qx, qy];
  }

  var make_move = function(i, j){
    issue_move(player_pos[0], player_pos[1], Math.floor((i - player_pos[0]) / 2), Math.floor((j - player_pos[1]) / 2));
  };

  for (var i = 0; i < grid.length; i++){
    var tr = $('<tr>', {
      'class': class_name(i, grid.length)
    });
    grid_pane.append(tr);
    for (var j = 0; j < grid[i].length; j++) {
      var td = $('<td>', {
        'class': (grid[i][j] ? 'empty_cell' : 'wall_cell') + ' ' +
                  class_name(j, grid[i].length),
        'ii': i,
        'jj': j,
        'click': function(){
          make_move(parseInt($(this).attr('ii')), parseInt($(this).attr('jj')));
        }
      });
      if ((i == start_pos[0]) && (j == start_pos[1]))
        td.addClass('start_cell');
      if ((i == exit_pos[0]) && (j == exit_pos[1]))
        td.addClass('exit_cell');

      tr.append(td);
      grid_objects[i][j] = td;
    }
  }

  $('tr.even').height(grid_size);
  $('td.even').width(grid_size);
  center_obj.height(grid_size * n + 5 * (n-1) + 20);
  center_obj.width(grid_size * m + 5 * (m-1) + 20);

  $(document).on('keydown', function(event){
    if (won_game) return;
    var px = player_pos[0], py = player_pos[1];
    var qx = px, qy = py;
    var movements = {
      'ArrowUp': [-1, 0],
      'ArrowDown': [1, 0],
      'ArrowLeft': [0, -1],
      'ArrowRight': [0, 1]
    };

    if (event.key in movements) {
      r = issue_move(px, py, movements[event.key][0], movements[event.key][1]);
      qx = r[0]; qy = r[1];
    }
  });
};

var game = function(difficulty){
  var page_body = $('body');
  page_body.html('');

  var game_pane = $('<div>', {
    'class': 'game_pane'
  });
  page_body.append(game_pane);

  var game_menu_pane = $('<div>', {
    'class': 'game_menu_pane'
  });
  game_pane.append(game_menu_pane);

  var game_result_pane = $('<div>', {
    'class': 'game_result_pane'
  });
  game_menu_pane.append(game_result_pane);

  var game_menu_buttons = $('<div>', {
    'class': 'game_menu_buttons'
  });
  game_menu_pane.append(game_menu_buttons);

  var go_back_button = $('<button>', {
    'class': 'go_back_button',
    'html': '<p>zmień poziom trudności</p><p>change difficulty level</p>'
  });
  go_back_button.click(function(){
    menu();
  });
  game_menu_buttons.append(go_back_button);

  var again_button = $('<button>', {
    'class': 'again_button',
    'html': '<p>restartuj poziom</p><p>restart level</p>'
  });
  again_button.click(function(){
    game(difficulty);
  });
  game_menu_buttons.append(again_button);

  var board_pane = $('<div>', {
    'class': 'board_pane'
  });
  game_pane.append(board_pane);

  maze(game_result_pane, board_pane, difficulty);
};

var menu = function(){
  var page_body = $('body');
  page_body.html('');

  var menu_pane = $('<div>', {
    'class': 'menu_pane'
  });
  page_body.append(menu_pane);

  var title_pane = $('<div>', {
    'class': 'title_pane',
    'html': '<p>Interaktywne labirynty online</p><p>Interactive online mazes</p><p class="author">Karol Pokorski - blog o edukacji (blog.pokorski.edu.pl)</p>'
  });
  menu_pane.append(title_pane);

  var menu_text = $('<div>', {
    'class': 'menu_text',
    'html': '<p>wybierz poziom trudności</p><p>choose difficulty level</p>'
  });
  menu_pane.append(menu_text);

  var menu_buttons = $('<div>', {
    'class': 'menu_buttons'
  });
  menu_pane.append(menu_buttons);

  var option_texts = [
    '<p>przedszkole</p><p>kindergarten</p>',
    '<p>bardzo łatwy</p><p>very easy</p>',
    '<p>łatwy</p><p>easy</p>',
    '<p>średni</p><p>medium</p>',
    '<p>trudny</p><p>hard</p>',
    '<p>bardzo trudny</p><p>very hard</p>'
  ];
  for (var i = 0; i < 6; i++) {
    var menu_button = $('<button>', {
      'class': 'menu_button',
      'html': option_texts[i],
      'difficulty': i,
    });
    menu_button.click(function(){
      game(parseInt($(this).attr('difficulty')));
    });
    menu_buttons.append(menu_button);
  }

  var instruction_pane = $('<div>', {
    'class': 'instruction_pane',
    'html': '<p>Gra polega na dojściu do celu (od czerwonej do zielonej kropki).</p>' +
            '<p>The goal of the game is to reach the green dot from the red one.</p>'
  });
  menu_pane.append(instruction_pane);
};

$(document).ready(function(){
  menu();
});
