var duration = 200; 
var epsilon = (1000 / 60 / duration) / 4;
var bezier = function(x1, y1, x2, y2, epsilon){
  var curveX = function(t){
    var v = 1 - t;
    return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
  };
  var curveY = function(t){
    var v = 1 - t;
    return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
  };
  var derivativeCurveX = function(t){
    var v = 1 - t;
    return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
  };
  return function(t){

    var x = t, t0, t1, t2, x2, d2, i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++){
      x2 = curveX(t2) - x;
      if (Math.abs(x2) < epsilon) return curveY(t2);
      d2 = derivativeCurveX(t2);
      if (Math.abs(d2) < 1e-6) break;
      t2 = t2 - x2 / d2;
    }

    t0 = 0, t1 = 1, t2 = x;

    if (t2 < t0) return curveY(t0);
    if (t2 > t1) return curveY(t1);

    // Fallback to the bisection method for reliability.
    while (t0 < t1){
      x2 = curveX(t2);
      if (Math.abs(x2 - x) < epsilon) return curveY(t2);
      if (x > x2) t0 = t2;
      else t1 = t2;
      t2 = (t1 - t0) * .5 + t0;
    }

    // Failure
    return curveY(t2);

  };
}

var c = {
  c: 200/2,
  clr: 'orange',
  bezier: bezier,
  r: function(circumference) {
    return circumference/(2*Math.PI);
  },
  p: function(radius) {
    return 2*Math.PI*radius;
  },
  s: function(circumference, count, w, spaceAfter) {
    w ? w = w : w = 5;
    var res = [w, (circumference/count)-w];
    spaceAfter ? res = [(circumference/count)-w, w] : res = res;
    return res;
  },
  rot: function(w) {
    return ['r-'+(w*2/3),c,c]
  },
  repeat: function(arr, count) {
    var res = [];
    for (var i = 0; i<count; i++) {
      res = res.concat(arr);
    };
    return res.concat(arr[0]);
  },
  timingFunc: bezier(.75, 0, 0.15, 1, epsilon ),
  timingFunc2: bezier(.5, 0, 0, 1, epsilon ),
  timingFunc3: bezier(0, 0, 0.25, 1, epsilon )
}


var h2 = Snap('#h2');
c.c = c.c*3;

function makeLine(snap, length, distance) {
return snap.path('M'+((c.c)+distance)+','+c.c+',L'+(c.c+length+distance)+','+c.c).attr({
  stroke: 'white',
  strokeWidth: .35,
});
}
function makeCircularDash(snap, perimiter, lengthPercent) {
return snap.circle(c.c, c.c, c.r(perimiter)).attr({
  fill: 'transparent',
  stroke: 'white',
  strokeWidth: 1,
  strokeDasharray: [perimiter*lengthPercent, perimiter-(perimiter*lengthPercent)]
})
}
function makeCircularDashSym(snap, radius, dashPercent) {
var perim = c.p(radius);
return snap.circle(c.c,c.c, radius).attr({
  fill: 'transparent',
  stroke: 'white',
  strokeWidth: 6,
  strokeOpacity: .3,
  strokeDasharray: [perim*dashPercent, (perim/2-(perim*dashPercent))]
});
}
function makeCircularDashPattern(snap, perimiter, dash, space, lengthPercent) {
var r13p = perimiter;
var r13sw = dash;
var r13ss = perimiter*lengthPercent;
var r13combo = [dash, space];
var r13repeat = Math.round((r13ss)/(dash+space));
return snap.circle(c.c, c.c, c.r(perimiter)).attr({
  fill: 'transparent',
  stroke: 'white',
  strokeWidth: 1,
  strokeDasharray: c.repeat(r13combo, r13repeat).concat((perimiter-r13ss)),
  // strokeDasharray: [perimiter*lengthPercent, perimiter-(perimiter*lengthPercent)]
})
}
function makeCircleLoc(snap, c1, c2, p) {
return snap.circle(c1, c2, p).attr({
  fill: 'transparent',
  stroke: 'white',
  strokeWidth: 0.35
});
}
function makeLineCircleGroup(snap,length,rotation,circle) {
var group, line = makeLine(snap,length,0);
var lineLoc = length+c.c;
if (!!circle) {
  var lineCircle = makeCircleLoc(snap,lineLoc+2,c.c,2);
  group = snap.group(line,lineCircle);
} else {group = line;}
group.attr({transform: ['r'+rotation,c.c,c.c]});
return group;
}

// C II
//======================================
// Full back circle
var xb1 = makeCircularDash(h2, 360*1.5, 1).attr({
  stroke: 'transparent',
  fill: 'white',
  fillOpacity: .5
});
var xbi1p = c.p(c.r(360*1.5)-1.5);
var xbi1rnd = (Math.floor(Math.random() * 10) + 4);
var xbisda = [];
for (var i = 0; i < xbi1rnd; i++) {
  var tmpprc = (Math.floor(Math.random() * 70) + 10)/100;
  xbisda.push(tmpprc*(xbi1p/xbi1rnd));
};
var xbi1 = makeCircularDash(h2, xbi1p, 1).attr({
  stroke: 'black',
  strokeWidth: 3,
  strokeOpacity: 0.3,
  strokeDasharray: xbisda
});

// Back layered dashes
for (var i = 1; i < 16; i++) {
  var tmpi = makeCircularDash(h2, (360*4.5)-(i*25), .2).attr({
    strokeWidth: .25,
    strokeOpacity: .85,
    transform: ['r'+(-(.1*360)),c.c,c.c]
  });
  infiniteRotateAnim(tmpi, 0, ((Math.random()*80000) + 70000))
}

// Outer Symetric
var xit1r = c.r(360*4);
var xit1 = makeCircularDashSym(h2, xit1r, .20).attr({
});
var xit2 = makeCircularDashSym(h2, xit1r, .025).attr({
  transform: ['r-15',c.c,c.c]
});
var xitg = h2.group(xit1, xit2);
infiniteRotateAnim(xitg, 0, 200000);


// Outer 75% light
var xbi1 = makeCircularDash(h2, c.p(c.r(360*2.9)-10), .75).attr({
  strokeWidth: 10,
  strokeOpacity: 0.35
});
// Outer 50% light
var xbi2 = makeCircularDash(h2, 360*2.9, .5).attr({
  strokeWidth: 10,
  strokeOpacity: 0.25
});
infiniteRotateAnim(xbi1, 0, 100000)
infiniteRotateAnim(xbi2, 0, 90000, 1)

// Inner layered dashes
var ild = []
for (var i = 1; i < 10; i++) {
  var perim = (360*2.55);
  var spacing = perim-(i*25);
  var perc = .40;
  var tmpi = makeCircularDash(h2, spacing, perc).attr({
    strokeWidth: .5,
    strokeOpacity: .5,
    transform: ['r'+(45),c.c,c.c]
  });
  infiniteRotateAnim(tmpi, 0, ((Math.random()*70000) + 65000), 1)
}

// Thin lines
// ----------------------------------------
  var mtl1 = makeLineCircleGroup(h2,270,240,1);
  var mtl2 = makeLineCircleGroup(h2,150,10,1);
  var mtl3 = makeLineCircleGroup(h2,135,70,0);
  var mtl4 = makeLineCircleGroup(h2,140,140,1);
  var mtl5 = makeLineCircleGroup(h2,135,270,1);
  var mtl6 = makeLineCircleGroup(h2,115,300,0);
  var lcg = (mtl1,mtl2,mtl3,mtl4,mtl5,mtl6);
  infiniteRotateAnim(mtl1, 240, 400000, -1);
  infiniteRotateAnim(mtl2, 10, 300000, -1);
  infiniteRotateAnim(mtl3, 70, 300000, -1);
  infiniteRotateAnim(mtl4, 140, 200000);
  infiniteRotateAnim(mtl5, 270, 200000);
  infiniteRotateAnim(mtl6, 3000, 200000);
  // Front inside of circle
  var xf2 = makeCircularDash(h2, 360*.75, .25).attr({
    stroke: '#555',
    strokeWidth: 20,
    strokeOpacity: 0.6,
    transform: ['r-'+((((360)*.25)/2)+180),c.c,c.c]
  });
  var xf22 = makeCircularDash(h2, 360*.65, .25).attr({
    stroke: '#555',
    strokeWidth: 14,
    strokeOpacity: 0.4,
    transform: ['r-'+(((360)*.25)/2),c.c,c.c]
  });
  var xf2g = h2.group(xf2, xf22);
  infiniteRotateAnim(xf2g, 0, 30000);
  var mlcg1 = makeLineCircleGroup(h2,250,310,0).attr({
    strokeWidth: 4,
    strokeDasharray: [(c.r(540)-15), 5, 10, 100],
  })
  var mlcg2 = makeLineCircleGroup(h2,140,0,0).attr({
    strokeWidth: 4,
    strokeDasharray: [10, 5, 125],
    transform: ['r170',c.c,c.c, 't50']
  })
  var mlcg3 = makeLineCircleGroup(h2,100,0,0).attr({
    strokeWidth: 2,
    strokeOpacity: .8,
    strokeDasharray: [10, 5, 125],
    transform: ['r25',c.c,c.c, 't160']
  })
  var mlcg4 = makeLineCircleGroup(h2,100,0,0).attr({
    strokeWidth: 2,
    strokeOpacity: 0.45,
    strokeDasharray: [10, 5, 125],
    transform: ['r55',c.c,c.c, 't60', 'r180']
  })
  var mlcg5 = makeLineCircleGroup(h2,220,110,0).attr({
    strokeWidth: 4,
    strokeOpacity: .7,
    strokeDasharray: [(c.r(540)-15), 100, 10, 10],
  })
  infiniteRotateAnim(mlcg1, 310, 250000);
  infiniteRotateAnim(mlcg2, 170, 250000, 1);
  infiniteRotateAnim(mlcg3, 25, 250000, 1);
  infiniteRotateAnim(mlcg4, 0, 250000, 1);
  infiniteRotateAnim(mlcg5, 110, 250000);

// Inner Belt of Alt Width Dashes
makeCircularDash(h2, 360*1.75, .1).attr({
  stroke: '#777',
  strokeWidth: 15, 
})
var xarr1 = (360*.1);
makeCircularDash(h2, 360*1.75, .15).attr({
  stroke: '#555',
  strokeWidth: 15, 
  transform: ['r'+(xarr1-1),c.c,c.c]
})
var xarr2 = (360*.15);
makeCircularDash(h2, 360*1.75, .125).attr({
  stroke: '#444',
  strokeWidth: 15, 
  transform: ['r'+(xarr1+xarr2-1),c.c,c.c]
})
var xarr3 = (360*.125);
makeCircularDash(h2, 360*1.75, .2).attr({
  stroke: '#777',
  strokeWidth: 15, 
  transform: ['r'+(xarr1+xarr2+xarr3-1),c.c,c.c]
})
var xarr4 = (360*.2);
makeCircularDash(h2, 360*1.75, .2).attr({
  stroke: '#555',
  strokeWidth: 15, 
  transform: ['r'+(xarr1+xarr2+xarr3+xarr4+10),c.c,c.c]
})

// Front inside of circle
var xf1 = makeCircularDash(h2, 360*.65, 1).attr({
  stroke: 'transparent',
  fill: '#ddd',
  fillOpacity: 1
});
var xf3 = makeCircularDash(h2, 360, .03).attr({
  stroke: '#ddd',
  strokeWidth: 70,
  fillOpacity: 1,
  transform: 'r207'
});

function infiniteRotateAnim(line, rotated, time, reverse) {
  var rot = 'r';
  if (reverse) rot = 'r-';
  line.attr({transform:['r'+(rotated),c.c,c.c]});
  line.animate({
    transform: [rot+(rotated+360),c.c,c.c]
  }, time, mina.linear, function(){
    infiniteRotateAnim(line, rotated, time);
  } );
}