class Fetch {
    constructor(baseUrl){
        this.baseUrl = baseUrl;
    }
    fetchAll(){
        return fetch(this.baseUrl + 'matchning?lanid=1&antalrader=10')
        .then((response) => response.json())
    }
    fetchOne(id){
        return fetch(this.baseUrl + id)
        .then((response) => response.json())
    }
}

const jobs = new Fetch('http://api.arbetsformedlingen.se/af/v0/platsannonser/');

const Model = (function(){
   
    return {
        handleAllJobs: function(){
            jobs.fetchAll()
            .then(jobs => {
                window.location.hash = '';
                View.displayJobs(jobs);
                View.displayNumberOfJobs(jobs);
                Controller.bindHomePageEventListeners();
            });
        },
        
        handleSingleJob: function(id){
            jobs.fetchOne(id)
            .then(job => {
                location.hash = `/annonsid/${id}`;
                View.displayOneJob(job);
                Controller.bindSingleJobPageEventListeners();
            });
        },

        shortenDate: function(date){
            return date.substring(0,10);
        },

        storeAdsInLocalStorage: function(myAds){
            //Save the input (the array of ads) as strings in localStorage
            localStorage.setItem("myAds", JSON.stringify(myAds));
        },

        getLocallyStoredAds: function(){ 
            var storedAds = localStorage.getItem("myAds");
        
            if (storedAds == null){
                //Define an empty array, otherwise the user won't be able to push anything into it
                return [];
            } else {
                //Turn array back from string to regular array - and return it
                return JSON.parse(storedAds); 
            }
        },

        fetchBasedOnUrl: function(){
            // TODO: Make this function accept several kinds of url-endpoints
            const jobAdId = window.location.hash.split(`/`).pop();
            if (window.location.hash.includes(`#/annonsid`)) {
                Model.handleSingleJob(jobAdId);
            } else {
                Model.handleAllJobs();
            }
        }
            
    }
}());

const Controller = (function (){ 
    
    return {
        bindHomePageEventListeners: function(){
            const allButtons = document.querySelectorAll('button');

            for(button of allButtons){
                
                if(button.classList.contains('showJobAd')){
                    let adID = button.dataset.id;
                    button.addEventListener('click', function(){
                        Model.handleSingleJob(adID);
                    });
                }

                if(button.classList.contains('saveJobAd')){
                    let adID = button.dataset.id;
                    
                    button.addEventListener('click', function(){
                        // We push the clicked ad into our locally stored ads
                        let myAds = Model.getLocallyStoredAds();
                        myAds.push(adID);           
                        Model.storeAdsInLocalStorage(myAds);
                    });
                }
            }
            
            const displaySavedAds = document.getElementById('displaySavedAds');

            displaySavedAds.addEventListener('click', function(){
                let myAds = Model.getLocallyStoredAds();
                View.displaySavedAds(myAds);
            });
        },

        bindSingleJobPageEventListeners: function(){
            const homeButton = document.getElementById('returnButton');
            homeButton.addEventListener('click', Model.handleAllJobs);

            const shareButton = document.getElementById('shareButton');
            const linkContainer = document.getElementById('linkContainer');
            shareButton.addEventListener('click', function(){
                View.toggleClassHidden(linkContainer);
            })
        },
        
        checkCurrentUrl: function () {
            window.addEventListener('hashchange', event => {
                Model.fetchBasedOnUrl();
            });
        }
    }
})();


const View = (function(){
    const wrapper = document.getElementById('wrapper');
    const numberOfJobsWrapper = document.getElementById('numberOfJobs');

     return {
        // View 10 latest ads
        displayJobs: function(jobs) {
            jobs = jobs.matchningslista.matchningdata;
            let jobInfo = ``;
            
            for(let job of jobs){
                //let shortenedDate = Model.shortenDate(job.sista_ansokningsdag);
                let shortenedDate = job.sista_ansokningsdag;
                jobInfo += `<div class="job-wrapper">
                <h2>${job.annonsrubrik}</h2>
                <p>Arbetsplats: ${job.arbetsplatsnamn}</p>
                <p>Kommun: ${job.kommunnamn}</p>
                <p>Sista ansökningsdag: ${shortenedDate}</p>
                <p>Yrkesroll: ${job.yrkesbenamning}</p>
                <p>Anställningstyp: ${job.anstallningstyp}</p>
                <a href="${job.annonsurl}">Länk till annons</a><br>
                <button class="saveJobAd" data-id="${job.annonsid}">Spara annons</button>
                <button class="showJobAd" data-id="${job.annonsid}">Visa annons</button>
                </div>`;
            }
            wrapper.innerHTML = jobInfo;
        },

        // Shows total number of jobs in Stockholm county
        displayNumberOfJobs: function(jobs) {
            totalJobs = jobs.matchningslista.antal_platsannonser;

            let jobInfo = ``;
               jobInfo = `<h2>Just nu finns ${totalJobs} 
               jobbannonser i Stockholms län</h2>`;
               numberOfJobsWrapper.innerHTML = jobInfo;
        },

        displayOneJob: function(job){
            job = job.platsannons;

            let jobInfo = ``;
                jobInfo += `<div id="${job.annons.annonsid}" class="single-job-wrapper">
                <button id="returnButton">Tillbaka</button>
                <h2>${job.annons.annonsrubrik}</h2>
                <h3>Kommun: ${job.annons.kommunnamn}</h3>
                <p>${job.annons.annonstext.replace(/(\r\n|\n|\r)/gm, '<br />')}</p>
                <button id="shareButton">Dela annons</button>
                <div id="linkContainer" class="hidden">Länk till annons: <a href="${job.annons.platsannonsUrl}">${job.annons.platsannonsUrl}</a></div>
                </div>`;

            wrapper.innerHTML = jobInfo;
        },

        displaySavedAds: function(myAds){
            savedAdsList = document.getElementById('savedAdsList');

            for (var ad of myAds){
                let listElement = document.createElement('li');
                listElement.innerText = ad;
                savedAdsList.appendChild(listElement);
            }
        },

        toggleClassHidden: function(element){
            element.classList.toggle('hidden');
        }
     }
}());

Controller.checkCurrentUrl();
Model.fetchBasedOnUrl();