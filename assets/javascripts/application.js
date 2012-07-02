window.puts = function () {
  var log = Function.prototype.bind.call(console.log, console);
  log.apply(window.console, arguments);
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
        .attr("cx", 360)
        .attr("cy", 360)
        .attr("text-anchor", "middle")
        .attr("display", "none")
        .attr('id', function (d, i) { return 'label_' + i; })
        .text(function(d, i) { return data.keys()[i]; });
      return this;
    }
  });

$(function () {
  d3.csv('data/salary_travel_2011.csv', function (pd) {
    window.dataset = new Dataset(pd);
    window.baseView = new BaseView({collection: window.dataset});
    $('#content').append(baseView.render().$el);
  });
});
