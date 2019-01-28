(function(){

	var defaultConfig = {
		"picWidth": 600,
		
		"picHeight": 400,
		
		"lbId": "",
		
		"picNum": 5,
		
		"picPath": [],
		
		"switchBtnShow": true,
		
		"switchDotShow": true,
		
		"pause": true,
		
		"autoSlide": true,
		
		"interTime": 3500,
		
		"loop": true		
	}

	var customConfig = {};
	
	var setConfig = function(con){
		if(typeof(con) === "undefined"){
			customConfig = defaultConfig;
		}
		else{
			for(var k in defaultConfig){
				if(typeof(con[k]) !== "undefined"){
					customConfig[k] = con[k];
				}
				else{
					customConfig[k] = defaultConfig[k];
				}
			}
		}	
		
		if(customConfig.picPath.length == 0 && customConfig.picNum != 5){
			customConfig.picNum = customConfig.picNum > 8? 8: customConfig.picNum;
		}
	}
	
	var positionInit = function($slide,param){
		var half_height = param.pheight / 2 - 30;
		var wRatio = param.picnum + 2;
		var tmpstr = "";
		var dotstr = "";
		
		if(param.picPath.length > 0){
			tmpstr = '<li class="p1 size_pic" style="background-image: url('+ param.picPath[param.picPath.length - 1] +');"></li>'
			dotsrt = '<span class="dot_now"></span>';
			for(var i = 1; i <= param.picPath.length; i++){
				tmpstr += '<li class="p' + (i + 1) + ' size_pic" style="background-image: url('+ param.picPath[i - 1] +');"></li>';
				if(i < param.picPath.length){
					dotsrt += '<span></span>';
				}
			}
			tmpstr += '<li class="p' + i + ' size_pic" style="background-image: url('+ param.picPath[0] +');"></li>'
			$slide.find(".pic_box").html(tmpstr);
			$slide.find(".dots").html(dotsrt);
		}
		else{
			tmpstr = '<li class="p1 size_pic" style="background-image: url(./css/images/slb' + param.picnum + '.png)"></li>';
			dotsrt = '<span class="dot_now"></span>';
			for(var i = 1; i <= param.picnum; i++){
				tmpstr += '<li class="p' + (i + 1) + ' size_pic"></li>';
				if(i < param.picnum){
					dotsrt += '<span></span>';
				}
			}
			tmpstr += '<li class="p' + (i + 1) + ' size_pic" style="background-image: url(./css/images/slb1.png)"></li>';
			$slide.find(".pic_box").html(tmpstr);
			$slide.find(".dots").html(dotsrt);
		}
		
		//设置轮播部分元素的样式
		$slide.css({width: param.pwidth + "px", height: param.pheight + "px"});
		$slide.find(".size_pic").css({width: param.pwidth + "px", height: param.pheight + "px"});
		$slide.find(".size_box").css({width: wRatio * param.pwidth + "px", height: param.pheight + "px"});
		$slide.find(".pic_box").css({"margin-left": "-" + param.pwidth + "px"});
		
		//设置切换按钮位置
		if(param.btnShow){
			//按钮宽、高为60px，距离边沿20px
			$slide.find(".btnl").css({top: half_height + "px", left: "20px"});
			$slide.find(".btnr").css({top: half_height + "px", left: (param.pwidth - 80) + "px"});
		}
		else{
			$slide.find(".btnl, .btnr").css({display: "none"});
		}
		
		//设置切换圆点位置
		if(param.dotShow){
			//圆点距离底部30px，直径14px, 左右10px边距
			$slide.find(".dots").css({top: (param.pheight - 30) + "px", left: (param.pwidth - 34 * param.picnum) / 2 + "px"});
		}
		else{
			$slide.find(".dots").css({display: "none"});
		}
		
	}
	
	//添加点击事件
	var addEvent = function($slide,param){
		//图片序号，当前是第几张图片
		var num = 1;
		//按钮锁，图片切换过程中锁定按钮
		var lock = 0;
		//定时器
		var inter0 = null;
		
		 //点击右边按钮，图片向左滚动
		$slide.find(".btnr").click(function(){
			if(lock == 1)
			{
				return 1;
			}
			else {
				lock = 1;
			}
			if(num < param.picnum)
			{
				num += 1;
				var sstr = -num * param.pwidth;
				$slide.find(".pic_box").animate({marginLeft: sstr + "px"},function(){
					lock = 0;
				});
			}
			else
			{
				var sstr = param.pwidth * (param.picnum + 1);
				if(param.loop){
					$slide.find(".pic_box").animate({marginLeft: "-" + sstr + "px"},function(){
						$(this).css({marginLeft: "-" + param.pwidth + "px"});
						lock = 0;
					});
				}
				else{
					$slide.find(".pic_box").animate({marginLeft: "-" + param.pwidth + "px"},function(){
						lock = 0;
					});
				}				
				num = 1;
			}
			$slide.find(".dots span").removeClass("dot_now");
			$slide.find(".dots span").eq(num - 1).addClass("dot_now");
		});
		
		//点击左边按钮，图片向右滚动
		$slide.find(".btnl").click(function(){
			if(lock == 1)
			{
				return 1;
			}
			else {
				lock = 1;
			}
			if(num > 1)
			{
				num -= 1;
				var sstr = -num * param.pwidth;
				$slide.find(".pic_box").animate({marginLeft: sstr + "px"},function(){
					lock = 0;
				});
			}
			else
			{
				num = param.picnum;
				var sstr = param.pwidth * param.picnum;
				if(param.loop){
					$slide.find(".pic_box").animate({marginLeft: "0px"},function(){						
						$(this).css({marginLeft: "-" + sstr + "px"});
						lock = 0;
					});
				}
				else{
					$slide.find(".pic_box").animate({marginLeft: "-" + sstr + "px"},function(){
						lock = 0;
					});
				}				
			}
			$slide.find(".dots span").removeClass("dot_now");
			$slide.find(".dots span").eq(num - 1).addClass("dot_now");
		});
		
		//点击下方小圆点切换图片
		$slide.find(".dots span").each(function(index){
			$(this).click(function(){
				if(lock == 1){
					return 1;
				}
				else {
					lock = 1;
				}
				num = index + 1;
				$slide.find(".dots span").removeClass("dot_now");
				$(this).addClass("dot_now");
				var sstr = -param.pwidth * index - param.pwidth;
				$slide.find(".pic_box").animate({marginLeft: sstr + "px"},function(){
					lock = 0;
				});
			});
		});
		
		//设置鼠标移入，切换按钮显示，根据配置设置是否暂停滑动
		if(param.pause && param.autoSlide){
			//鼠标移入，停止自动切换图片
			$slide.mouseenter(function(){
				clearInterval(inter0);
				$slide.find(".btns").addClass("deep");
			});
			//鼠标离开，启动自动切换图片
			$slide.mouseleave(function(){
				clearInterval(inter0);
				inter0 = setInterval(interSlide, param.interTime);
				$slide.find(".btns").removeClass("deep");
			});
		}
		else{
			$slide.mouseenter(function(){
				$slide.find(".btns").addClass("deep");
			});
			$slide.mouseleave(function(){
				$slide.find(".btns").removeClass("deep");
			});
		}
		
		//自动轮播
		var interSlide = function(){
			if(lock == 1){
				return 1;
			}
			else{
				lock = 1;
			}
			
			//处理图片滚动
			if(num < param.picnum){
				num += 1;
				var sstr = -num * param.pwidth;
				$slide.find(".pic_box").animate({marginLeft: sstr + "px"},function(){
					lock = 0;
				});
			}
			else{
				var sstr = param.pwidth * (param.picnum + 1);
				//滚动到首尾时，判断是否循环滚动
				if(param.loop){
					$slide.find(".pic_box").animate({marginLeft: "-" + sstr + "px"},function(){
						$(this).css({marginLeft: "-" + param.pwidth + "px"});
						lock = 0;
					});
				}
				else{
					$slide.find(".pic_box").animate({marginLeft: "-" + param.pwidth + "px"},function(){
						lock = 0;
					});
				}				
				num = 1;
			}
			//设置切换圆点显示
			$slide.find(".dots span").removeClass("dot_now");
			$slide.find(".dots span").eq(num - 1).addClass("dot_now");
		}
		
		//默认启动自动切换图片
		if(param.autoSlide){
			inter0 = setInterval(interSlide, param.interTime);
		}
	}
	
	//启动函数
	var run = function(config){	
		//处理自定义config
		setConfig(config);
		
		//读取config
		var picNum = customConfig.picPath.length > 0? customConfig.picPath.length: customConfig.picNum;
		var $olbs = $("#"+customConfig.lbId);
		
		if($olbs.length > 0){
			//初始化页面元素css
			positionInit($olbs, {
				"pwidth": customConfig.picWidth, 
				"pheight": customConfig.picHeight, 
				"picnum": picNum, 
				"picPath": customConfig.picPath,
				"btnShow": customConfig.switchBtnShow,
				"dotShow": customConfig.switchDotShow
			});
			//添加事件
			addEvent($olbs, {
				"pwidth": customConfig.picWidth, 
				"picnum": picNum,
				"interTime": customConfig.interTime,
				"autoSlide": customConfig.autoSlide,
				"pause": customConfig.pause,
				"loop": customConfig.loop
			});
		}
	}
	
	//暴露到全局环境
	if(typeof(window.SSlide) === "undefined"){
		window.SSlide = run;
	}
	
})();

