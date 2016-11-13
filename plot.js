$(document).ready(function() {

    /** read input data file using HTML5 FileReader api */
    function readDataFile(e) {
        var file = e.target.files[0];
        if (!file) {
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            displayContents(contents);
            parseInputData(contents);
        };
        reader.readAsText(file);
    }


    /** append file content for debugging */
    function displayContents(contents) {
        $("#file-content").text(contents);
    }


    function parseInputData(contents) {
        /** name of method names */
        var methods = [];

        /** x-y values for scalar version */
        var scalar_x = ["scalar_x"];
        var scalar_y = ["scalar"];
        var scalar_tootlip = [];

        /** x-y values for vector version */
        var vector_x = ["vector_x"];
        var vector_y = ["vector"];
        var vector_tootlip = [];

        /** split input file by new lines */
        var lines = contents.split("\n")

        /** iterate over all lines in file */
        $.each(lines, function(index, line) {

            if (line.length > 0) {
                try {
                    /** split single line from input data */
                    var lineElements = line.split(" ");

                    /** 1st column is name of method */
                    methods.push(lineElements[0]);

                    /**  2nd column is max ULP scalar version should be shown in tooltip */
                    scalar_tootlip.push(lineElements[1]);

                    /** 3rd column is throughput [cycle] scalar version */
                    scalar_y.push(lineElements[2]);

                    /** 4th column is latency [cycle] scalar  version */
                    scalar_x.push(lineElements[3]);

                    /** same as above for vector version */
                    vector_tootlip.push(lineElements[4]);
                    vector_x.push(lineElements[6]);
                    vector_y.push(lineElements[5]);

                } catch (err) {
                    console.log(err);
                }
            }
        });

        /** generate plot using c3 js */
        var chart = c3.generate({

            /** name of div */
            bindto: '#line-chart',

            /** size in pixel */
            size: {
                height: 500,
                width: 700
            },

            /** data for plot */
            data: {

                /** series */
                xs: {
                    scalar: 'scalar_x',
                    vector: 'vector_x',
                },

                /** columns */
                columns: [
                    scalar_x,
                    vector_x,
                    scalar_y,
                    vector_y,
                ],

                /** scatter plot */
                type: 'scatter'
            },

            /** x-y axis label */
            axis: {
                x: {
                    label: 'Latency',
                    tick: {
                        fit: false
                    }
                },
                y: {
                    label: 'Throughput'
                }
            },

            /** some extra details to show tooltip */
            tooltip: {

                format: {

                    /** prepare the title for tooltip : todo : need better handling for duplicate values */
                    title: function(d) {
                        d = d.toString();
                        var maxUlp = "";
                        var indOfVal = scalar_x.indexOf(d);

                        if (indOfVal < 0) {
                            indOfVal = vector_x.indexOf(d);
                            if (indOfVal > -1) {
                                maxUlp = vector_tootlip[indOfVal - 1];
                            }
                        } else {
                            maxUlp = scalar_tootlip[indOfVal - 1];
                        }
                        return "Method: " + methods[indOfVal - 1] + " (" + maxUlp + ")";
                    },

                    /** prepare the value for tooltip : todo : need better handling for duplicate values */
                    value: function(value, ratio, id) {
                        if (id == "scalar") {
                            var indOfVal = scalar_y.indexOf(value.toString());
                            var xValue = scalar_x[indOfVal];
                            return xValue + "," + value;
                        } else if (id == "vector") {
                            var indOfVal = vector_y.indexOf(value.toString());
                            var xValue = vector_x[indOfVal];
                            return xValue + ", " + value;
                        } else {
                            return "Error...";
                        }
                    }
                }
            }
        });

    }

    /** on file input change, redraw plot */
    $("#file-input").change(readDataFile);

});