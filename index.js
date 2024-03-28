import GraxApi from 'grax_api';
import JSZip from "jszip";

// GRAX API Javascript Sample
let defaultClient = GraxApi.ApiClient.instance;
let bearer_token = defaultClient.authentications['bearer_token'];

// Set GRAX_URL and GRAX_TOKEN environment variables
// export GRAX_URL=<URL>
// export GRAX_TOKEN=<TOKEN>

defaultClient.basePath = process.env.GRAX_URL;
bearer_token.accessToken = process.env.GRAX_TOKEN;

// Documentation - https://github.com/graxlabs/grax-js/blob/main/docs/AutoBackupApi.md
let apiInstance = new GraxApi.AutoBackupApi();
let opts = {
  'maxBehind': 56 // Number | Maximum time behind before the backups are considered unhealthy, in seconds.
};
apiInstance.backupsHealthGet(opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ');
    console.log(data);
  }
});

// Documentation - https://github.com/graxlabs/grax-js/blob/main/docs/SearchApi.md

var searchOpts = GraxApi.searchopts;
let searchApiInstance = new GraxApi.SearchApi();

let searchopts = {
  'searchCreate': new GraxApi.SearchCreate()
}
searchopts.searchCreate.object ='Opportunity';
searchopts.searchCreate.timeField = 'modifiedAt';
searchopts.searchCreate.timeFieldMax = '2024-03-18T05:00:00Z';
searchopts.searchCreate.timeFieldMin = '2024-01-01T04:00:00Z';
searchopts.searchCreate.status = 'live';

searchApiInstance.searchCreate(searchopts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Successfully Created Search');
    GetSearch(data.id,searchApiInstance,DownLoadSearch);
  }
});

function GetSearch(searchId,searchApiInstance,callback){
  searchApiInstance.searchGet(searchId, (error, data, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Search Status : ' + data.status);
      if (data.status != 'success'){
        GetSearch(searchId,searchApiInstance,callback);
      }else{
        callback(data.id,searchApiInstance);
      }
    }
  });
}

function DownLoadSearch(searchId,searchApiInstance){
  let searchOptions = {
    fields:'Id,CloseDate,Amount,StageName,Name,AccountId,OwnerId,CreatedDate,FiscalQuarter,FiscalYear,Fiscal'
  }
  searchApiInstance.searchDownload(searchId, searchOptions, (error, data, response) => {
    if (error) {
      console.error(error);
    } else {
      var zip = new JSZip();
      zip.loadAsync(response.body).then(function(data) {
          data.forEach(function(relativepath,zipfile){
              if (zipfile.name!='.readme'){
                  zipfile.async("string").then(function(unzipped){
                      console.log('Unzipped Succcessfully: ' + zipfile.name);
                      // This holds the CSV Data
                      // console.log(unzipped);
                  });
              }
          });
      });
    }
  });
}

