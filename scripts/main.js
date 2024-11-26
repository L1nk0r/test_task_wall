class Wall {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.angle = this.get_angle();
  }

  get_range_to_point = (x, y) => {
    let A = this.y2 - this.y1;
    let B = this.x1 - this.x2;
    let C = this.x2 * this.y1 - this.x1 * this.y2;

    let d =
      Math.abs(A * x + B * y + C) / Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2));

    return d;
  };

  get_proection = (x, y) => {
    let scalar =
      (x - this.x1) * (this.x2 - this.x1) + (y - this.y1) * (this.y2 - this.y1);

    let scale = Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2);

    let res_x = this.x1 + (scalar / scale) * (this.x2 - this.x1);

    let res_y = this.y1 + (scalar / scale) * (this.y2 - this.y1);

    return [res_x, res_y];
  };

  get_angle = () => {
    let dx = this.x2 - this.x1;
    let dy = this.y2 - this.y1;

    return Math.atan2(dy, dx);
  };
}

class Room {
  constructor() {
    this.points = [];
    this.walls = [];
    this.start_point = null;
    this.last_point = null;
    this.is_ended = false;
    this.point_size = 8;
    this.get_length = 0;
  }

  add = (x, y) => {
    if (this.points.length === 0) this.start_point = { x: x, y: y };
    this.points.push({ x: x, y: y });
    this.get_length += 1;
    this.last_point = { x: x, y: y };
    if (this.points.length > 1) {
      this.walls.push(
        new Wall(
          this.points[this.points.length - 2].x,
          this.points[this.points.length - 2].y,
          this.points[this.points.length - 1].x,
          this.points[this.points.length - 1].y
        )
      );
    }
  };

  get_closest_point = (x, y) => {
    if (this.get_length > 0) {
      let min_dest = this.get_dest(x, y, this.points[0].x, this.points[0].y);
      let closest_point = this.points[0];

      this.points.forEach((point) => {
        let new_min_dest = this.get_dest(x, y, point.x, point.y);
        if (new_min_dest < min_dest) {
          min_dest = new_min_dest;
          closest_point = { x: point.x, y: point.y };
        }
      });

      return [min_dest, closest_point.x, closest_point.y];
    } else {
      return [-1];
    }
  };

  get_closet_wall = (x, y) => {
    if (this.is_ended) {
      let d = this.walls[0].get_range_to_point(x, y);
      let min_wall = this.walls[0];
      this.walls.forEach((wall) => {
        let new_d = wall.get_range_to_point(x, y);
        if (new_d < d) {
          d = new_d;
          min_wall = wall;
        }
      });
      return [d, min_wall];
    } else {
      return [-1];
    }
  };

  get_dest = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  find = (x, y) => {
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].x === x && this.points[i].y === y) {
        return i;
      }
    }
    return -1;
  };
}

function redraw_finished_room(ctx, room) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(room.points[0].x, room.points[0].y);
  room.points.forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });
  ctx.fillStyle = "grey";
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function redraw(ctx, room) {
  if (!room.is_ended) {
    if (room.get_length > 0) {
      ctx.beginPath();
      ctx.moveTo(room.points[0].x, room.points[0].y);
      room.points.forEach((point) => {
        ctx.fillRect(point.x, point.y, 8, 8);
        ctx.lineTo(point.x, point.y);
        ctx.lineWidth = 2;
        ctx.moveTo(point.x, point.y);
      });
      ctx.stroke();
    }
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(room.points[0].x, room.points[0].y);
    room.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });

    ctx.fillStyle = "grey";
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    console.log("filled");
    room.walls.push(
      new Wall(
        room.last_point.x,
        room.last_point.y,
        room.start_point.x,
        room.start_point.y
      )
    );
    console.log(room.points, room.walls);
    draw_sofa(room);
  }
}

function draw() {
  console.log("draw");
  const canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 6;

    let room = new Room();

    var prev_position_x = -1;
    var prev_position_y = -1;

    canvas.onmousemove = function (event) {
      // стираем всё
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // отрисовываем сохранённые углы и стены
      redraw(ctx, room);

      var last_point = { x: event.offsetX - 5, y: event.offsetY - 5 };
      if (room.get_length > 0) {
        last_point.x = room.points[room.get_length - 1].x;
        last_point.y = room.points[room.get_length - 1].y;
      }

      var mouse_x = event.offsetX;
      var mouse_y = event.offsetY;

      let min_dest = room.get_closest_point(mouse_x, mouse_y);
      if (min_dest[0] != -1) {
        if (min_dest[0] < 20) {
          mouse_x = min_dest[1] + 5;
          mouse_y = min_dest[2] + 5;
        }
      }

      //Рисуем курсор точку
      ctx.fillStyle = "blue";
      ctx.fillRect(mouse_x - 5, mouse_y - 5, 8, 8);
      //Рисуем предположительную линию
      ctx.beginPath();
      ctx.moveTo(last_point.x, last_point.y);
      ctx.lineTo(mouse_x - 5, mouse_y - 5);
      ctx.stroke();
      prev_position_x = mouse_x;
      prev_position_y = mouse_y;

      canvas.onmousedown = function (event) {
        //console.log(mouse_x, mouse_y, room.start_point);
        if (room.get_length > 1) {
          if (
            mouse_x - 5 === room.start_point.x &&
            mouse_y - 5 === room.start_point.y
          ) {
            canvas.onmousemove = null;
            console.log("ended");
            room.is_ended = true;
            redraw(ctx, room);
          }
        }
        if (room.find(mouse_x - 5, mouse_y - 5) === -1) {
          console.log(room.find(mouse_x - 5, mouse_y - 5));
          if (!room.is_ended) room.add(mouse_x - 5, mouse_y - 5);
          ctx.moveTo(room.points[0].x, room.points[0].y);
          redraw(ctx, room.points);
        }
      };
    };
  }
}

function draw_rotated_sofa(img, angle, ctx, mouse_x, mouse_y, wall) {
  let proection = wall.get_proection(mouse_x, mouse_y);
  let x = proection[0];
  let y = proection[1];

  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI);

  ctx.drawImage(img, 0, 0);

  ctx.restore();
}

function draw_sofa(room) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  room.walls.forEach((wall) => {
    console.log(wall.get_angle());
  });

  var sofa_img = new Image();
  sofa_img.src = "../assets/sofa.png";

  canvas.onmousemove = function (event) {
    let mouse_x = event.offsetX;
    let mouse_y = event.offsetY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redraw_finished_room(ctx, room);

    let closest_wall_attrs = room.get_closet_wall(mouse_x, mouse_y);
    let closest_wall = closest_wall_attrs[1];
    let dest = closest_wall_attrs[0];

    if (dest < 50) {
      draw_rotated_sofa(
        sofa_img,
        closest_wall.angle,
        ctx,
        mouse_x,
        mouse_y,
        closest_wall
      );
    } else {
      ctx.drawImage(sofa_img, mouse_x, mouse_y);
    }
  };
}

const start_button = document.getElementById("start");

if (start_button) {
  start_button.addEventListener("click", draw);
  console.log("Button ok!");
} else {
  console.log("Button is not ok((");
}

window.onload = function () {};
