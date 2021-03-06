(function($){
    
    //一个保存了全局dataTable的Table
    $.dataTablesTables={};
    methods={
        destroy:function(url,csrfToken,ids,cb){
            $.ajax(url,{
                data:{
                    "authenticity_token":csrfToken,
                    "_method":"DELETE",
                    "ids":ids
                },
                method:"POST"
            }).always(function(data,content,response){
                cb(ids,response.status==204,response.status);
            });
        }
    };
    
    $.MM_dataTable=function(selector,dataTablesOptions,urls){
        var csrfToken=$("meta[name='csrf-token']").attr("content");  //构造请求的时候需要用
        var data=$.extend($.dataTableDefaultConfiguration,{
            "ajax": {
                "url":urls.query,
                "type": "GET",
                "dataSrc": "data"
            },
            "processing": true,
            "serverSide": true
        },dataTablesOptions);  //databales的配置文件
        var table=$(selector);
        
        //初始化
        var dataTableObject=table.DataTable(data);
        
        //绑定事件
        table.find("#dataTableSelectAll").click(function(){
            var flag=this.checked;
            $(selector+" .itemSelector").each(function(){this.checked=flag;});
        });
        
        var gatherSelectedItemId=function(){
            var ret=[];
            $(selector+" .itemSelector[name=item]").each(function(){
                if(this.checked){ret.push($(this).attr("item-id"));}
            });
            return ret;
        };
        
        //删除某条数据之后的回调
        var deleteCb=function(ids,success,status){
            if(success){
                //todo:删除成功,如果与此同时没有另一个人新加一个记录的话,这里可以直接从dom中remove掉而不需要刷新
                //嘛暂时先刷新页面
                location.reload();

            }else{
                //删除失败
                if(status==401){
                    alert("无权操作");
                }
            }
        };
        
        
        $("#mutipleDeleteBtn").click(function(){
            //show alert
            var ids=gatherSelectedItemId();
            if(ids.length<1){
                return false;
            }
            $.showConfirmDialog("确认","确认删除"+(ids.length>1 ? "这"+ids.length+"项" : "")+"?",function(){
                methods.destroy(urls.delete,csrfToken,gatherSelectedItemId(),deleteCb);
            },function(){
                console.log("cancel");
            });
            
        });
        
        var ret= {
            "dataTableObject": dataTableObject,
            "destroy": function (ids) {
                methods.destroy(urls.delete, csrfToken, ids, deleteCb);
            }
        };
        $.dataTablesTables[selector]=ret;
        return ret;
        
    }
}(jQuery));