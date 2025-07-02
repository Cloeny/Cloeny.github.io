$fn=100;
$fa = 1;
$fs = 0.1;




radius=20;
faces=48;//边数
hei=3;
thickness=1;//灯笼纸的厚度
calhei=2*hei; //上下两个部分的总高度
smallscale=0.9;
bigscale=1/smallscale; //半径
addrad=5;


//褶皱的形状
module basic(){
linear_extrude(height=hei,scale=smallscale)

difference(){
    offset(r=addrad,$fn=1)
circle(r=radius,$fn=faces);
    
    offset(r=addrad-thickness,$fn=1)
circle(r=radius,$fn=faces);
}

translate([0,0,hei])
linear_extrude(height=hei,scale=bigscale)
difference(){
    offset(r=addrad*smallscale,$fn=1)
circle(r=radius*smallscale,$fn=faces);
    
    offset(r=addrad*smallscale -thickness,$fn=1)
circle(r=radius*smallscale,$fn=faces);
}

}


repeattime=24/hei;

for(count=[0:1:repeattime-1]){//表示basic模型重复的次数
translate([0,0,count*calhei])
basic();
    
    }
    
totalhei=calhei*repeattime;


//上下的圆形
translate([0,0,-1])   
linear_extrude(height=1)
circle(r=radius+9,$fn=faces);
    
    difference(){
    translate([0,0,totalhei])
        linear_extrude(height=1)
    circle(r=radius+9,$fn=faces);
    
    translate([0,0,totalhei])
        linear_extrude(height=1)
    circle(r=radius-5,$fn=faces);
        
    }
    
    
    //下面的绳子
    translate([0,0,-10])
    linear_extrude(height=10)
    circle(r=0.1,$fn=20);
   

//珠子
    translate([0,0,-11])
    sphere(r=1,$fn=50);  
    
    
    //流苏？
    translate([0,0,-25.5])
    cylinder(h=14,r1=2,r2=0,$fn=60);
    
    
    
    //已下是三根绳子的部分
    a=21;

    hull(){
    translate([0,a,48])
    cylinder(r=0.1,h=0.1,$fn=20);
        
     translate([0,0,48+25])
     cylinder(r=0.1,h=0.1,$fn=20);
    }
        
     hull(){
    translate([a*sin(120),a*cos(120),48])
    cylinder(r=0.1,h=0.1,$fn=20);
        
     translate([0,0,48+25])
     cylinder(r=0.1,h=0.1,$fn=20);
    }
    
     hull(){
    translate([a*sin(240),a*cos(240),48])
    cylinder(r=0.1,h=0.1,$fn=20);
        
     translate([0,0,48+25])
     cylinder(r=0.1,h=0.1,$fn=20);
    }
    
    
    //三根绳子上的珠子
    translate([0,0,totalhei+25])
    sphere(r=1,$fn=48);
    
    
    
    