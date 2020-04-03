var budgetController = (function(){

    var Income = function(id,description,value) {
        this.id =id
        this.description = description
        this.value =value
    };
    var Expense = function(id,description,value) {
        this.id =id
        this.description = description
        this.value =value
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc){
        if(totalInc>0){
             this.percentage = Math.round((this.value / totalInc)*100)
        }
        else{
            this.percentage = -1;
        }        
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    var calculateTotal = function(type){
        var sum = 0;
        data.individual[type].forEach(function(cur){
            sum = sum + cur.value
        });
        data.total[type]=sum;
    }
    var data = {
        individual: {
            exp : [],
            inc : [],
        },
        total: {
            exp : 0,
            inc : 0,
        },
        budget: 0,
        percentage: -1,
    };
    return {
        addItem: function(type,des,val){
            var newitem, ID;
            //create new id
            if(data.individual[type].length > 0){
                ID = data.individual[type][data.individual[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            //create new item
            if(type==='exp'){
                newitem = new Expense(ID,des,val)
            }else if(type==='inc'){
                newitem = new Income(ID,des,val)
            }
            //push item
            data.individual[type].push(newitem);
            return newitem;
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.individual[type].map(function(current){
             return current.id;   
            })
            index = ids.indexOf(id);
            if(index !== -1){
                data.individual[type].splice(index,1)
                
            }
        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //budget: inc - exp
            data.budget = data.total.inc - data.total.exp;
            //calc % of inc spent
            if(data.total.inc > 0){
                data.percentage = Math.round((data.total.exp/data.total.inc)*100);  
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentage: function(){

            data.individual.exp.forEach(function(cur){
                cur.calcPercentage(data.total.inc);
            })
        },

        getPercentage: function(){
            var allPerc = data.individual.exp.map(function(cur){
                    return cur.getPercentage();
            })
            return allPerc;
        },



        getBudget: function(){
            return{
                budg: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                perc: data.percentage,
            }
        },
        testing: function(){
            console.log(data);
        }
    }
})();



var UIController = (function(){
    var DOMstrings = 
     {
        inputType: '.add__type',
        inputDescription:'.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        budgetLabel: '.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    }

     var formatNum =  function(num, type){
        var numSplit;
        num = Math.abs(num)
        num = num.toFixed(2)
        numSplit = num.split('.');
        int = numSplit[0]
        if(int.length>3){
            int = int.substr(0, int.length-3)+','+int.substr(int.length-3, 3);
        }
        dec = numSplit[1]
        return (type ==='exp'? '-':'+') + ' ' + int+'.'+dec
    }
    var forEachNodeList = function(list, callback){
        for(var i = 0; i< list.length; i++){
            callback(list[i], i);
        }
    }
    return {
        getinput: function(){
            return {
            type: document.querySelector(DOMstrings.inputType).value, //will return inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }     
        },
 
        addListItem: function(obj,type){
            //create html string with placeholder text
            var html, newHtml, element;
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type ==='exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml= newHtml.replace('%description%', obj.description);
            newHtml= newHtml.replace('%value%',formatNum(obj.value, type));

            //insert html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID))
        },

        clearFields: function(){
            var fields, fieldsArray; 
            fields = document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields)
            fieldsArray.forEach(function(current,index,arr){
                    current.value = "";
            });
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            var type
            obj.budg > 0? type = 'inc': type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budg,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = '$ '+formatNum(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent ='$ '+formatNum(obj.totalExp,'exp');
            
            if(obj.perc>0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.perc + ' %';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayMonth: function(){
            var now = new Date();
            var month = now.getMonth();
            var months = ['January','February','March','April','May','June','July','August','September','October','Novermber','December'] 
            var year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month]+' '+year;
        },



        displayPercentage: function(percentage){
            var fields = document.querySelectorAll(DOMstrings.expensePercentage);

            
            forEachNodeList(fields, function(current,index){
                if(percentage[index]>0){
                    current.textContent = percentage[index] + '%';
                }else{
                    current.textContent = '---';
                }
            })
        },
        changeType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType +','+
            DOMstrings.inputDescription+','+DOMstrings.inputValue);
            forEachNodeList(fields, function(cur){
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },
        


        getDomstring: function(){
            return DOMstrings;
        },
        
    }

})();


var controller = (function(bCtrl,uiCtrl){

    var setupEventlisteners = function(){
        var DOM = uiCtrl.getDomstring()
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)
        
        document.addEventListener('keypress',function(event){
            if(event.keyCode===13 || event.which===13 ){
                ctrlAddItem();
        }        
    });
        document.querySelector(DOM.container).addEventListener('click', ctrldeleteitem)
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);
    }

    var updateBudget = function(){

        //calc budget
        bCtrl.calculateBudget()
        //return budget
        var budget = bCtrl.getBudget();
        //display on ui
        uiCtrl.displayBudget(budget);

    }

    var updatePercentage = function(){

        //calc %
        bCtrl.calculatePercentage();

        //read % from the budget controller
        var percentage = bCtrl.getPercentage();
        

        // update UI
        uiCtrl.displayPercentage(percentage);

    }
   
    var ctrlAddItem = function(){
        var input, newitem;
        //get input data
        input = uiCtrl.getinput();


        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //add item to budget controller
        newitem = bCtrl.addItem(input.type,input.description,input.value);
        
        //add item to ui
        
        uiCtrl.addListItem( newitem, input.type);
        
        //clear the fields
        
        uiCtrl.clearFields();

        //calc and update budget
                
        updateBudget();

        //calc and update %

        updatePercentage();
        };
           

    }


    var ctrldeleteitem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);


            //delete item from data structure
            bCtrl.deleteItem(type,ID)

            //delete from ui
            uiCtrl.deleteListItem(itemID)


            //update budget
            updateBudget();
        }
        
    }

    return {
        init: function(){
            console.log('Application has started.');
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budg: 0,
                totalInc: 0,
                totalExp: 0,
                perc: -1,
            });

            setupEventlisteners();
        }
    }
    
})(budgetController,UIController);

controller.init();