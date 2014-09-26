define([
  'jquery',
  'underscore',
  'backbone',
  'views/alert',
  'views/hostUsage',
  'views/modalHostSettings',
  'text!templates/hostsListItem.html'
], function($, _, Backbone, AlertView, HostUsageView, ModalHostSettingsView,
    hostsListItemTemplate) {
  'use strict';
  var HostListItemView = Backbone.View.extend({
    className: 'host',
    template: _.template(hostsListItemTemplate),
    events: {
      'click .host-title a': 'onSettings',
      'click .host-cpu-usage-btn': 'onCpuUsageGraph',
      'click .host-mem-usage-btn': 'onMemUsageGraph',
      'click .graph-period': 'onGraphPeriod'
    },
    initialize: function() {
      this.hostUsageView = new HostUsageView({
        host: this.model.get('id')
      });
      this.addView(this.hostUsageView);
      setTimeout(function() {
        this.uptimer = setInterval((this._updateTime).bind(this), 1000);
      }.bind(this), 1000);
    },
    deinitialize: function() {
      clearInterval(this.uptimer);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.update();
      this.$('.host-graph-viewer').append(
        this.hostUsageView.render().el);
      return this;
    },
    update: function() {
      this.$('.host-title a').text(this.model.get('name'));
      this.$('.host-status .status-text').text(
        this.model.get('status').charAt(0).toUpperCase() +
        this.model.get('status').slice(1));
      if (this.model.get('uptime')) {
        this.$('.host-uptime .status-text').text(
          window.formatUptime(this.model.get('uptime')));
      }
      else {
        this.$('.host-uptime .status-text').text('-');
      }
      if (this.model.get('user_count') === 0) {
        this.$('.host-users .status-num').text('-/-');
      }
      else {
        this.$('.host-users .status-num').text(this.model.get(
          'users_online') + '/' + this.model.get('user_count'));
      }

      if (this.model.get('status') === 'offline') {
        this.$('.host-del').removeAttr('disabled');
      }
      else {
        this.$('.host-del').attr('disabled', 'disabled');
      }
    },
    onCpuUsageGraph: function() {
      this.$('.host-mem-usage-btn').removeClass('btn-primary');
      this.$('.host-mem-usage-btn').addClass('btn-default');
      this.$('.host-cpu-usage-btn').removeClass('btn-default');
      this.$('.host-cpu-usage-btn').addClass('btn-primary');
      this.hostUsageView.setType('cpu');
    },
    onMemUsageGraph: function() {
      this.$('.host-cpu-usage-btn').removeClass('btn-primary');
      this.$('.host-cpu-usage-btn').addClass('btn-default');
      this.$('.host-mem-usage-btn').removeClass('btn-default');
      this.$('.host-mem-usage-btn').addClass('btn-primary');
      this.hostUsageView.setType('mem');
    },
    onSettings: function() {
      this.$('.host-title a').addClass('disabled');

      var modal = new ModalHostSettingsView({
        model: this.model.clone()
      });
      this.listenToOnce(modal, 'applied', function() {
        var alertView = new AlertView({
          type: 'warning',
          message: 'Successfully saved host settings.',
          dismissable: true
        });
        $('.alerts-container').append(alertView.render().el);
        this.addView(alertView);
      }.bind(this));
      this.addView(modal);

      this.$('.host-title a').removeClass('disabled');
    },
    onGraphPeriod: function(evt) {
      this.$('.graph-period').removeClass('btn-primary');
      this.$('.graph-period').addClass('btn-default');
      $(evt.target).removeClass('btn-default');
      $(evt.target).addClass('btn-primary');

      if ($(evt.target).hasClass('graph-1m')) {
        this.hostUsageView.setPeriod('1m');
      }
      else if ($(evt.target).hasClass('graph-5m')) {
        this.hostUsageView.setPeriod('5m');
      }
      else if ($(evt.target).hasClass('graph-30m')) {
        this.hostUsageView.setPeriod('30m');
      }
      else if ($(evt.target).hasClass('graph-2h')) {
        this.hostUsageView.setPeriod('2h');
      }
      else if ($(evt.target).hasClass('graph-1d')) {
        this.hostUsageView.setPeriod('1d');
      }
    },
    onDelete: function() {
      var modal = new ModalDeleteHostView({
        model: this.model.clone()
      });
      this.listenToOnce(modal, 'applied', function() {
        var alertView = new AlertView({
          type: 'warning',
          message: 'Successfully deleted host.',
          dismissable: true
        });
        $('.alerts-container').append(alertView.render().el);
        this.addView(alertView);
      }.bind(this));
      this.addView(modal);
    },
    _updateTime: function() {
      if (!this.model.get('uptime')) {
        return;
      }
      this.model.set({
        uptime: this.model.get('uptime') + 1
      });
      this.$('.host-uptime .status-text').text(
        window.formatUptime(this.model.get('uptime')));
    },
    onToggleHidden: function(evt) {
      if (!evt.ctrlKey && !evt.shiftKey) {
        return;
      }
      if (this.$el.hasClass('show-hidden')) {
        this.$('.toggle-hidden').removeClass('label-success');
        this.$('.toggle-hidden').addClass('label-primary');
        this.$el.removeClass('show-hidden');
      }
      else {
        this.$('.toggle-hidden').addClass('label-success');
        this.$('.toggle-hidden').removeClass('label-primary');
        this.$el.addClass('show-hidden');
      }
    }
  });

  return HostListItemView;
});