define(function(require) {

    var civilState = {
        SI: "Single",
        EN: "Engaged",
        MA: "Married",
        WI: "Widowed",
        IR: "In a relationship",
        IO: "In an open relationship",
        IC: "It's complicated",
        DI: "Divorced",
        SE: "Separated"
    };

    var smoking = {
        S: "I smoke",
        D: "I don't smoke, but guests can smoke here",
        N: "No smoking allowed"
    };

    var whereSleepingType = {
        C: "Common area",
        P: "Private area",
        S: "Shared private area"
    };

    var wingStatus = {
        Y: "Yes",
        N: "No",
        M: "Maybe"
    };

    return {
        choices: {
            civilState: civilState,
            smoking: smoking,
            whereSleepingType: whereSleepingType,
            wingStatus: wingStatus
        }
    };

});

