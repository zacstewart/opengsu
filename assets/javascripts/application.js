window.puts = function () {
  var log = Function.prototype.bind.call(console.log, console);
  log.apply(window.console, arguments);
};
Number.prototype.toCurrency = function(c, d, t){
  var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
var
  Datum = Backbone.Model.extend(),
  Dataset = Backbone.Collection.extend({
    initialize: function () {
    },
    model: Datum,
    totals: function () {
      return d3.map(this.reduce(function (m, d) {
        m[d.get('Position')] = m[d.get('Position')] ? +m[d.get('Position')] + +d.get('Salary') : +d.get('Salary');
        return m;
      }, {}));
    },
    means: function () {
      return d3.map(this.reduce(function (m, d) {
        m[d.get('Position')] = m[d.get('Position')] ? (+m[d.get('Position')] + +d.get('Salary')) / 2 : +d.get('Salary');
        return m;
      }, {}));
    }
  }),
  BaseView = Backbone.View.extend({
    template: function () { return _.template($('#base_view').text()); },
    render: function () {
      this.$el.html(this.template())
      return this;
    },
    events: {
      'click a[href="#total"]': 'showTotals',
      'click a[href="#mean"]': 'showMeans'
    },
    showTotals: function (e) {
      e.preventDefault();
      var view = new PieView({collection: this.collection});
      this.$('.graph').html(view.render('totals').$el);
    },
    showMeans: function (e) {
      e.preventDefault();
      var view = new PieView({collection: this.collection});
      this.$('.graph').html(view.render('means').$el);
    }
  }),
  PieView = Backbone.View.extend({
    initialize: function () {
      this.width = 720;
      this.height = 720;
      this.outerRadius = Math.min(this.width, this.height) / 2;
      this.innerRadius = this.outerRadius * .6;
      this.color = d3.scale.category20();
      this.donut = d3.layout.pie();
      this.arc = d3.svg.arc().innerRadius(this.innerRadius).outerRadius(this.outerRadius);
    },
    render: function (type) {
      var type = type || 'totals';
      var _this = this;
      var data = (type === 'totals' ? this.collection.totals() : this.collection.means());
      var vis = d3.select(this.el)
        .append('svg')
        .data([data.values()])
        .attr('width', this.width)
        .attr('height', this.height);
      var arcs = vis.selectAll('g.arc')
        .data(this.donut)
        .enter().append('g')
        .attr('class', 'arc')
        .attr('transform', 'translate(' + this.outerRadius + ',' + this.outerRadius + ')');
      arcs.append('path')
        .attr('fill', function (d, i) { return _this.color(i); })
        .attr('d', this.arc)
        .on('mouseover', function (d, i) { d3.select('text#label_' + i).attr('display', 'inline') })
        .on('mouseout', function (d, i) { d3.select('text#label_' + i).attr('display', 'none') });
      arcs.append("text")
        .attr("cx", this.width / 2)
        .attr("cy", this.height / 2)
        .attr("text-anchor", "middle")
        .attr("display", "none")
        .attr('id', function (d, i) { return 'label_' + i; })
        .text(function(d, i) { return '$' + d.value.toCurrency(2, '.', ',') + ' ' + data.keys()[i] });
      return this;
    }
  }),
  SidebarView = Backbone.View.extend({
    template: function () { return _.template($('#sidebar_template').text()); },
    render: function () {
      this.$el.html(this.template());
      return this;
    },
    events: {
      'click': 'navigateTo'
    },
    navigateTo: function (e) {
      e.preventDefault();
    }
  });

$(function () {
  d3.csv('data/salary_travel_2011.csv', function (pd) {
    window.sidebarView = new SidebarView();
    window.sidebarView.render().$el.appendTo('#sidebar');
    window.dataset = new Dataset(pd);
    window.baseView = new BaseView({collection: window.dataset});
    $('#content').append(baseView.render().$el);
  });
});
