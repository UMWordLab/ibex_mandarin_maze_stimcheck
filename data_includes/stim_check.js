PennController.ResetPrefix(null); // Shorten command names (keep this line here))
PennController.DebugOff();

var shuffleSequence = seq("nameentry", 
                        "intro", "setcounter",
                        "starter",
 // trials named _dummy_ will be excluded by following:
            //            sepWith("sep", rshuffle(startsWith("break"), startsWith("hit"), startsWith("filler"))),
                        followEachWith("sep",randomize(anyOf(startsWith("rc")))),
 						"sendresults",
                        "closing"
                );

newTrial("nameentry",
    newVar("partName").global()
    ,
    newText("instr2", "请用英文输入您的姓名：").print()
    ,
    newHtml("partpage2", "<input type='text' id='partName' name='participant name' min='1' max='120'>").print()
    ,
    newButton("clickcontinue", "点此继续").print().wait( 
        getVar("partName").set( v=>$("#partName").val() ).testNot.is('')
    )
)
.log("partName", getVar("partName"))
               
// This is run at the beginning of each trial
Header(
    // Declare a global Var element "ID" in which we will store the participant's ID
    newVar("partName").global()    
)
.log( "partname" , getVar("partName") ) // Add the ID to all trials' results lines

var showProgressBar =false;

var practiceItemTypes = ["practice"];

var manualSendResults = true;

var defaults = [
    "Maze", {redo: true, time:1000, emess: "答案错误", rmess: "请确认您选择最佳的词语延续句子"}, //uncomment to try "redo" mode
];

// following is from the A-maze site to make breaks every 15(ish) maze sentences
// you have to set the write number of total items and number of blocks to start with, and the right condition names, etc.
// calculate the following numbers to fill in the values below (not including practice trials-
// for Mandarin hit/break study:
// total maze sentences a participant will be presented: 96
// sentences per block: 24
// number of blocks: 4

function modifyRunningOrder(ro) {

    var new_ro = [];
    item_count=0;
    for (var i in ro) {
      var item = ro[i];
      // fill in the relevant stimuli condition names on the next line including fillers (all that should be counted for break purposes)
      if (item[0].type.startsWith("rc")|| item[0].type.startsWith("fill")) {
          item_count++;
          new_ro.push(item);
        // number after percent (remainder) after item_count is how many items between breaks. last number is total-items - 1
          if (item_count%24===0 & item_count<96){
         // value for item_count=== should be total_items - items_per_block (to trigger message that last block is coming up)
         // text says "only 1 set of sentences left"
              if (item_count===72){
                    ro[i].push(new DynamicElement("Message", 
                        { html: "<p>只剩下一组句子了！</p>", transfer: 3000 }));
                } else {
                // first number is the total number of blocks. second number is number of items per block
                // message says "end of block. n blocks left."
                    ro[i].push(new DynamicElement("Message", 
                        { html: "<p>本组句子结束，还剩"+(4-(Math.floor(item_count/24)))+" 组句子</p>", transfer: 3000 }));
                }
                // next message is added for all breaks after the count message
                ro[i].push(new DynamicElement("Message", 
                    { html: "<p>您有30秒时间休息， 如果您需要的话，可以短暂的看向屏幕以外的地方或者拉伸身体来放松，30秒后实验会自动开始。</p>", transfer: 30000 }));
          }
        } else {
    // if it's not an experimental trial, such as separator or other item, just show the item
             new_ro.push(item);
        }
    }
    return new_ro;
  }
  
// lextale instructions

PennController("LexTale_instructions",
  defaultText
  ,
  newText("LexTale_InstructionText", "您好，这是一个汉字测试。在下一页，您将会看到90个看上去像“汉字”的字，当中只有一些是真正存在的汉字。您需要对每一个字做出判断，如果您认为该字是在中文里存在的（即使您不能够明确地说出该字的意思）或者是您知道该字的话，请点击“是汉字”，如果您认为该字在中文里是不存在的，请点击“不是汉字”。您无需快速回答每一道问题，但请您根据您的第一反应来作答，不用过度的犹豫。请在没有任何外来帮忙的情况下独立完成此测试（不要使用任何汉语词典！）。所有的字皆为简体中文。") 
  ,
  newCanvas("myCanvas", 600, 600)
          .settings.add(0,0, getText("LexTale_InstructionText"))
          .print()
  ,              
  newTextInput("Subject", randomnumber = Math.floor(Math.random()*1000000))             
  ,
  newButton("Start")
      .print()
      .wait()
  ,
  newVar("Subject")
      .settings.global()
      .set( getTextInput("Subject") )
  )
  .log( "Subject" , getVar("Subject") )

/// Closing text
newTrial("closing",
    newText("closingText", "All done - thanks!")
        .print().wait()
)

// experimental stimuli:
// template items will be pushed into native items = [] with fake PC trial _dummy_ output

Template("stimuli.csv", row => {
    items.push(
        [[row.label, row.item] , "PennController", newTrial(
            newController("Maze", {s: row.sentence, a: row.alternative, redo: true, time:1000, emess: "答案错误", rmess: "请确认您选择最佳的词语延续句子"})
              .print()
              .log()
              .wait()
        )
        .log("counter", __counter_value_from_server__)
        .log("label", row.label)
        .log("item", row.item)
        .log("list", row.group)
        ]
    );
    return newTrial('_dummy_',null);
})

var items = [

	["setcounter", "__SetCounter__", { }],

	["sendresults", "__SendResults__", { }],

	["sep", "MazeSeparator", {normalMessage: "正确! 请按任意键继续", errorMessage: "错误！请按任意键继续"}],

    ["consent", "Form", { html: { include: "consent.html" } } ],

    ["intro", "Form", { html: { include: "intro1.html" } } ],

    ["tech", "Form", { html: { include: "tech.html" } } ],

    ["startpractice", Message, {consentRequired: false,
        html: ["div",
            ["p", "您可以先做三组练习"]
            ]}],
//
//  practice items
//

    [["practice", 801], "Maze", {s:"老板的 手机 在会议中 响了", a:"x-x-x 咱们 氢氧化钠 狐狸"}],
    [["practice", 802], "Maze", {s:"爸爸 边看 电视 边讲 电话", a:"x-x-x 气孔 避免 腐朽 抓住"}],
    [["practice", 803], "Maze", {s:"运动员 在健身房 做了 重量 训练", a:"x-x-x 莎士比亚 螳螂 愤怒 爸爸"}],

   // message that the experiment is beginning

   ["starter", Message, {consentRequired: false,
	html: ["div",
		   ["p", "点此开始主实验"]
		  ]}],

// completion: 

    ["completion", "Form", {continueMessage: null, html: { include: "completion.html" } } ]

// leave this bracket - it closes the items section
];
