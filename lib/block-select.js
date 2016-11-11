
(function(){

  "use strict";

  jQuery.fn.extend({

    blockSelect: function() {

      var $dest = $("div[data-object='block-select-placeholder']");

      
      $dest.on("input-changed", function (event, value) {
        console.log(value);
      });


      var observe = function () {
        $(document).on("change", "input[data-object='input-field']", function () {
          $dest.trigger("input-changed", $(this).val());
        });
      };


      $(this).each(function (_, node) {

        var $source = $(node).find("li").map(function (index, li) { return {id: $(li).data("id"), title: $(li).html()}}).toArray();

        var textarea = ``;

        var input = `<input type="text" data-object="input-field" />`;

        $dest.html(`<textarea></textarea><select></select>${input}`);

      });

      observe();

    }

  });


})();
