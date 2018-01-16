
/**
 * Class SemantifyIt
 */

function SemantifyIt(key)
{


    /**
     * variable for websiteApiKey
     *
     * @param string $websiteApiKey ;
     */
    var websiteApiKey;

    /**
     * variables for some api settings
     *
     * @param string $websiteKey ;
     */
    var live_server = "https://semantify.it/api";

    var staging_server = "https://staging.semantify.it/api";

    var live = true;

    var jquery = true;

    /**
     *
     * var for displaying errors or not
     *
     * true  => errors are shown
     * false => errors are hidden
     *
     * @var boolean
     */
    var error = true;

    /**
     *
     * var for debugging
     *
     * true  => debugging is on
     * false => debugging is off
     *
     * @var boolean
     */
    var debug = false;
    var step = 0;

    /**
     * Checking for jquery
     *
     * @param string $key
     */

    if(!jQuery) {
        jquery = false;
    }


    /**
     * Setters and getters
     * */


    /**
     * @return int
     */
    this.getLive = function ()
    {
        return live;
    };


    /**
     * @param int $live
     */
    this.setLive = function (live2)
    {
        live = live2;
    };




    /**
     *
     * fet error reporting value
     *
     * @return boolean
     */
    this.getError = function ()
    {
        return error;
    };


    /**
     *
     * showing errors
     * true  => errors are shown
     * false => errors are hidden
     *
     * @param boolean $error
     */
    this.setError = function (error2)
    {
        error = error2;
    };


    /**
     * getter for websiteApiKey
     *
     * @return string
     */
    this.getWebsiteApiKey = function ()
    {
        //return ""
        if ((error) && ((websiteApiKey=="") || (websiteApiKey=="0"))){
            throw new Error("Caught problem: no API key saved!");
        }
        return websiteApiKey;
    };


    /**
     * setter for websiteApiKey
     *
     * @param string $websiteApiKey
     */
    this.setWebsiteApiKey = function (websiteApiKey2)
    {
        websiteApiKey = websiteApiKey2;
    };


    /**
     * SemantifyIt constructor.
     *
     * @param string $key
     */


    if(typeof key === "undefined"){
        key = "";
    }

    if (key != "") {
        this.setWebsiteApiKey(key);
    }



    /**
     *
     * Function responsible for getting stuff from server - physical layer
     *
     * @param string $url url adress
     * @return string return content
     * @throws Exception
     */
    function get (url)
    {

        //if allow url fopen is allowed we will use file_get_contents otherwise curl
        var content = curl("GET", url);

        //console.log(content);

        if (content === false) {
            throw new Error('Error getting content from '  + "" +  url);
        }

        if (content == "") {
            throw new Error('No content received from '  + "" +  url);
        }

        return content;

    }

    function post (url, params)
    {
        var action = "POST";
        var content = curl(action, url, params);

        if (content === false) {
            throw new Error('Error posting content to '  + "" +  url);
        }

        if (content == "") {
            throw new Error('No content returned from ' + "" + action + "" + ' action at url '  + "" +  url);
        }

        return content;

    }

    function patch (url, params)
    {
        var action = "PATCH";
        var content = curl(action, url, params);

        if (content === false) {
            throw new Error('Error patching content to '  + "" +  url);
        }

        if (content == "") {
            throw new Error('No content returned from ' + "" + action + "" + ' action at url '  + "" +  url);
        }

        if (content == "Not Found") {
            throw new Error('Annotation Not found for ' + "" + action + "" + ' action at url '  + "" +  url);
        }

        return content;

    }


    function curl (type, url, params)
    {
        var response = "";

        if(typeof params === "undefined"){
            params = "";
        }


        var params_string = JSON.stringify(params);

        //console.log(params_string);


        if(jquery){

            jQuery.ajax({
                url: url,
                async: false,
                type: type,
                dataType: 'json',
                data: params_string,
                contentType: "application/json",
                beforeSend: function(xhr) {
                    //xhr.setRequestHeader("Authentication", "Basic ZnJvbWFwcGx********uOnRoM24zcmQ1UmgzcjM=") //Some characters have been replaced for security but this is a true BASE64 of "username:password"
                },
                success: function(data){
                    response = data;
                },
                error: function (request, status, error) {
                    if(error){
                        throw new Error('Ajax error: '  +  request.responseText);
                    }
                }
            });

        }else{

        }

        return response;

    }

    function isContentAvailable (input)
    {
        if ((input == "") || (input == false) || (strpos(input, 'error') !== false)) {
            return false;
        }

        return true;
    }


    function buildQuery(params) {

        debugMe(params);

        if(jquery){
           return jQuery.param(params);
        }else{
            var esc = encodeURIComponent;
            var query = Object.keys(params).map(k => esc(k) + '=' + esc(params[k])).join('&');
            return query;
        }

    }


    function debugMe(text){
        if(debug){
            step++;
            console.log("step: "+ step + " text: "+ text+" function: "+ arguments.callee.caller.toString());
        }
    }

    /**
     *
     * transport layer for api
     *
     * @param       $type
     * @param       path
     * @param array $params
     * @return string
     */
    function transport (type, path, params)
    {
        /* set aparams to array if they are not initialized */
        if(typeof params === "undefined"){
            params = new Array();
        }


        /** url with server and path */
        var url = live_server  + '/'  +  path;
        //if it is in staging server than switch to staging api
        if (live == false) {
            url = staging_server  +  '/' +  path;
        }

        //debugMe(url);

        switch (type) {

            case "GET":

                try {

                    var query = "";
                    if(params.length >0){
                        query = buildQuery(query);
                    }

                    var fullurl = url +  query;
                    return get(fullurl);

                } catch (/*Error*/ e) {

                    if(error){
                        throw new Error('GET Transport Caught exception: '  +  e.message );
                    }

                    return false;
                }
                break;

            case "POST":
            case "PATCH":
                try {
                    var fullurl = url;

                    /* determine function name automatically by type and call it */
                    return obj[type.toLowerCase()].call(obj, fullurl, params);

                } catch (/*Error*/ e) {
                    if(error){
                        throw new Error('POST/PATCH Transport Caught exception: '  +  e.message );
                    }

                    return false;
                }

                break;
            default:
                debugMe(type);

        }
    }

    /**
     *
     * function for decoding, it can be easily turned of if necessary
     *
     * @param $json
     * @return mixed
     */
    function decoding (json)
    {
        return JSON.parse(json);
    }




    /**
     * returns website annotations based on websiteApiKey
     *
     * @return array
     */
    this.getAnnotationList = function ()
    {

        var json = transport("GET", "annotation/list/"  + "" +  this.getWebsiteApiKey());

        return json;
    };



    /**
     * post a new annotation to the server
     *
     * @return array
     */
    this.postAnnotation = function (json)
    {

        var params = new Array();
        params["content"] = json;
        json = transport("POST", "annotation/"  +   this.getWebsiteApiKey(), params);


        return json;
    };



    /**
     *
     * update an annotation by uid
     *
     * @param $json
     * @param $uid
     * @return string
     */
    this.updateAnnotation = function (json, uid)
    {
        var params = new Array();
        params["content"] = json;
        json = transport("PATCH", "annotation/" + "" + uid + "" + "/"  + "" + this.getWebsiteApiKey(), params);


        return json;
    };




    /**
     *
     * Funciton which get annotations by url
     *
     * @param $url
     * @return string
     */
    this.getAnnotationByURL = function (url)
    {
        return transport("GET", "annotation/url/"  + "" +  rawurlencode(url));
    };



    /**
     *
     * returns json-ld anotations based on anotations id
     *
     * @param string $id
     * @return json
     */
    this.getAnnotation = function (id)
    {

        return transport("GET", "annotation/short/"  + "" +  id);

    };




}






















