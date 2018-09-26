
/**
 * Class SemantifyIt
 */

function SemantifyIt(key, secret)
{
    /** for calling self methods */
    var self = this;

    /**
     * variable for websiteApiKey
     *
     * @param string $websiteApiKey ;
     */
    this.websiteApiKey = undefined;

    /**
     * website secret
     */
    this.websiteApiSecret = undefined;

    /**
     * variables for some api settings
     *
     * @param string $websiteKey ;
     */
    this.live_server = "https://semantify.it";

    this.staging_server = "https://staging.semantify.it";

    this.api_path = "api";

    this.live = 0;

    this.jquery = true;

    /**
     *
     * var for displaying errors or not
     *
     * true  => errors are shown
     * false => errors are hidden
     *
     * @var boolean
     */
    this.error = false;

    /**
     *
     * var for debugging
     *
     * true  => debugging is on
     * false => debugging is off
     *
     * @var boolean
     */
    this.debug = false;
    this.step = 0;

    /**
     * Checking for jquery
     *
     * @param string $key
     */

    if(!jQuery) {
        self.jquery = false;
    }


    /**
     * Setters and getters
     * */

    /**
     * @return int
     */
    this.getLive = function ()
    {
        return self.live;
    };


    /**
     * @param int $live
     */
    this.setLive = function (live)
    {
        self.live = live;
    };


    /**
     *
     * fet error reporting value
     *
     * @return boolean
     */
    this.getError = function ()
    {
        return self.error;
    };


    /**
     *
     * showing errors
     * true  => errors are shown
     * false => errors are hidden
     *
     * @param boolean $error
     */
    this.setError = function (error)
    {
        self.error = error;
    };


    /**
     * getter for websiteApiKey
     *
     * @return string
     */
    this.getWebsiteApiKey = function ()
    {
        //return ""
        if ((self.error) && ((self.websiteApiKey==="") || (self.websiteApiKey==="0"))){
            throw new Error("Caught problem: no API key saved!");
        }
        return self.websiteApiKey;
    };

    /**
     * getter for websiteApiKey
     *
     * @return string
     */
    this.getWebsiteApiSecret = function ()
    {
        //return ""
        if ((self.error) && ((self.websiteApiSecret==="") || (self.websiteApiSecret==="0"))){
            throw new Error("Caught problem: no API secret saved!");
        }
        return self.websiteApiSecret;
    };

    /**
     * setter for websiteApiKey
     *
     * @param string $websiteApiKey
     */
    this.setWebsiteApiKey = function (websiteApiKey)
    {
        self.websiteApiKey = websiteApiKey;
    };


    /**
     * setter for websiteApiSecret
     *
     * @param string $websiteApiSecret
     */
    this.setWebsiteApiSecret = function (websiteApiSecret)
    {
        self.websiteApiSecret = websiteApiSecret;
    };

    /**
     * SemantifyIt constructor.
     *
     * @param string $key
     */

    if(typeof key === "undefined"){
        key = "";
    }

    if (key !== "") {
        self.setWebsiteApiKey(key);
    }

    if(typeof secret === "undefined"){
        secret = "";
    }

    if (secret !== "") {
        self.setWebsiteApiSecret(secret);
    }
   



    /**
     * Classes methods
     * Cake is a lie!
     *
     * */


    function isContentAvailable (input)
    {
        if ((input === "") || (input === false) || (strpos(input, 'error') !== false)) {
            return false;
        }

        return true;
    }


    function buildQuery(params) {

        debugMe(params);

        if(self.jquery){
           return jQuery.param(params);
        }else{
            var esc = encodeURIComponent;
            var query = Object.keys(params).map(k => esc(k) + '=' + esc(params[k])).join('&');
            return query;
        }

    }


    function debugMe(text){
        if(self.debug){
            self.step++;
            console.log("step: "+ self.step + " text: "+ text+" function: "+ arguments.callee.caller.toString());
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
    function transport (type, path, params, callback, settings)
    {

        var headers = null;
        var noApiPath = false;


        /* set aparams to array if they are not initialized */
        if(typeof params === "undefined"){
            params = new Array();
        }

        /** url with server and path */
        var url = self.live_server  + '/' + self.api_path + '/'  +  path;

        / * if it is in staging server than switch to staging api */
        if (self.live === false) {
            url = self.staging_server + '/' + self.api_path  +  '/' +  path;
        }

        //console.log(settings);
        /* check settings  */
        if((typeof settings !== "undefined")){

            /* if no api url is needed */
            if((settings.noApiPath !== "undefined") && (settings.noApiPath)){

                noApiPath = true;
                url = self.live_server + '/' + path;
                if (self.live === false) {
                    url = self.staging_server + '/' + path;
                }

            }

            if((settings.headers !== "undefined")){
                headers = settings.headers;
            }
        }


        switch (type) {

            case "GET":

                try {


                    var query = "";
                    if(params.length >0){
                        query = buildQuery(query);
                    }

                    var fullurl = url +  query;

                    if(noApiPath){
                        fullurl = url;
                    }

                    return get(fullurl, headers, callback, settings);

                } catch (/*Error*/ e) {

                    if(self.error){
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
                    if(type=="POST"){
                        return post( fullurl, params, headers, callback, settings);
                    }

                    if(type=="PATCH"){
                        return patch( fullurl, params, headers, callback, settings);
                    }

                } catch (/*Error*/ e) {
                    if(self.error){
                        throw new Error('POST/PATCH Transport Caught exception: '  +  e.message );
                    }

                    return false;
                }

                break;
            default:
                debugMe(type);

        }
    }

    function get(url, headers, callback, settings)
    {

        //if allow url fopen is allowed we will use file_get_contents otherwise curl
        var content = curl("GET", url, undefined, headers, callback, settings);

        //console.log(content);

        if (content === false) {
            throw new Error('Error getting content from '  + "" +  url);
        }

        if (content == "") {
            throw new Error('No content received from '  + "" +  url);
        }

        return content;

    }

    function post(url, params, headers, callback, settings)
    {

        var action = "POST";
        var content = curl(action, url, params, headers, callback, settings);

        if (content === false) {
            throw new Error('Error posting content to '  + "" +  url);
        }

        if (content == "") {
            console.log('No content returned from ' + " " + action + "" + ' action at url '  + "" +  url);
            //throw new Error('No content returned from ' + "" + action + "" + ' action at url '  + "" +  url);
        }

        return content;

    }

    function patch(url, params, headers, callback)
    {
        var action = "PATCH";
        var content = curl(action, url, params, headers, callback, settings);

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



    /**
     *
     * Function responsible for getting stuff from server - physical layer
     *
     * @param string $url url adress
     * @return string return content
     * @throws Exception
     */


    function curl (type, url, params, headers, callback, settings)
    {
        var response = "";
        var params_string = null;
        var timeout = 2000;

        if(typeof params !== "undefined"){
            params_string = JSON.stringify(params);
        }

        if(typeof settings !== "undefined") {
            if ((settings.timeout !== "undefined")) {
                timeout = settings.timeout;
            }
        }


        var contentType = null;
        switch (type){
            case "POST":
                var contentType = 'application/json ; charset=utf-8';
                break;
        }

        //console.log(headers);

        if(self.jquery){
            console.log("ajax url",url);
            console.log("ajax headers",headers);

            jQuery.ajax({
                url: url,
                async: true,
                timeout: timeout,
                type: type,
                data: params_string,
                contentType: contentType,
                beforeSend: function(xhr) {
                    if(typeof headers !== "undefined"){
                        for (var key in headers) {
                            if (headers.hasOwnProperty(key)) {
                                xhr.setRequestHeader(key, headers[key]);

                            }
                        }
                    }
                },
                success: function(data){
                    console.log("success",data);
                    self.callbackHandler(callback, data);
                },
                error: function (request, status, error) {
                    response = request.responseText;
                    console.log("error",request);
                    self.callbackHandler(callback, response);
                    if(request.status===404){
                        throw new Error('Semantify Ajax error: '  +  response);
                    }
                }
            });

        }else{

            throw new Error('no jquery! - api will not work');
        }

        return response;

    }


    /**
     *
     * function for handlig callbacks scopes
     *
     * @param callback, response
     */
    this.callbackHandler = function (callback, response) {
        if (typeof callback !== "undefined") {
            try {
                /* local scope */
                callback(response);
            }
            catch (e) {
                try {
                    /* global scope */
                    window[callback](response);
                }
                catch (e) {
                    /* if no function than we return what we received */
                    console.log(callback + " is not a function "+ e.message);
                    return false;
                }
            }
        }
        /* if no function than we return what we received */
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
    this.getAnnotationList = function (callback)
    {
        return transport("GET", "annotation/list/"  + "" +  this.getWebsiteApiKey(), undefined, callback);
    };



    /**
     * post a new annotation to the server
     *
     * @return array
     */
    this.postAnnotation = function (json,callback)
    {
        var settings = {};
        var secret = self.getWebsiteApiSecret();
        settings.headers = {'website-secret': '' + secret};
        return transport("POST", "annotation/"  +   this.getWebsiteApiKey(), json, callback, settings);
    };



    /**
     *
     * update an annotation by uid
     *
     * @param $json
     * @param $uid
     * @return string
     */
    this.updateAnnotation = function (json, uid, callback)
    {
        var settings = {};
        var secret = self.getWebsiteApiSecret();
        settings.headers = {'website-secret': '' + secret};
        return transport("PATCH", "annotation/uid/" + uid, json, callback, settings);
    };


    /**
     *
     * save annotaion to website by defined key and secret
     *
     * @param $json
     * @param $uid
     * @return string
     */
    this.saveAnnotationToWebsite = function (json, apikey, secret,  callback)
    {
        var settings = {};
        settings.headers = {'website-secret': '' + secret};
        return transport("POST", "annotation/"  +  apikey, json, callback, settings);
    };






    /**
     *
     * Funciton which get annotations by url
     *
     * @param $url
     * @return string
     */
    this.getAnnotationByURL = function (url,callback)
    {
        return transport("GET", "annotation/url/"  + "" +  rawurlencode(url), undefined, callback);
    };



    /**
     *
     * returns json-ld anotations based on anotations id
     *
     * @param string $id
     * @return json
     */
    this.getAnnotation = function (id, callback)
    {

        return transport("GET", "annotation/short/"  + "" +  id, undefined, callback);

    };

    /**
     *
     * returns domain specification by id
     *
     * @param string $id
     * @return json
     */
    this.getDomainSpecification = function (id, callback)
    {
        return transport("GET", "domainSpecification/"  +  id, undefined, callback);
    };

    /**
     *
     * returns domain specification by search Name
     *
     * @param string name
     * @return json
     */
    this.getDomainSpecificationBySearchName = function (name, callback)
    {
        return transport("GET", "domainSpecification/searchName/"  +  name, undefined, callback);
    };


    /**
     *
     * returns domain specification by hash
     *
     * @param string $hash
     * @return json
     */
    this.getDomainSpecificationByHash = function (hash, callback)
    {
        return transport("GET", "domainSpecification/hash/"  +  hash, undefined, callback);
    };




    /**
     *
     * returns file from semantify
     *
     * @param string $id
     * @return json
     */
    this.getFileFromSemantify = function (url_path, callback) {
        var settings = {noApiPath:true};
        return transport("GET", url_path, undefined, callback, settings);
    }

    /**
     *
     * login to semantify
     *
     * @param string credentials
     * @return json
     */

    this.login = function (credentials, callback)
    {
        //console.log(credentials);
        return transport("POST", "login/", credentials, callback);
    };


    /**
     *
     * Get list of websites
     *
     *
     */

    this.getWebsites = function (semantifyToken, callback)
    {
        var settings = {headers:{'Authorization': 'Bearer ' + semantifyToken}};
        return transport("GET", "website/", undefined, callback, settings);
    };


    /**
     *
     * Validate of annotation
     *
     */
    this.validateAnnotation = function (annotation, callback){
        return transport("POST", "validate/annotation", annotation, callback);
    }

    /**
     *
     * retrieve of html
     *
     */
    this.retrieveHtml = function (urlInJson, callback){
        var settings = {};
        settings.timeout = 15000;
        return transport("POST", "retrieve/html", urlInJson, callback, settings);
    }

    /**
     *
     * extractJsonld
     *
     */
    this.extractJsonld = function (htmlInJSON, callback){
        var settings = {};
        settings.timeout = 15000;
        return transport("POST", "extract/jsonld", htmlInJSON, callback, settings);
    }





}






















