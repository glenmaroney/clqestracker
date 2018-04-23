import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-datalabels';
import NavBar from '../NavBar/NavBar';

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Target : this.props.Baseline * 0.65,
      Rem : (this.props.Baseline - this.props.HypVal - this.props.CRVal) - (this.props.Baseline * 0.65),
      Baseline: -this.props.Baseline,
      HypVal: - this.props.HypVal,
      CRVal: -this.props.CRVal
    }
  }

  render() {
  
    const ChartNames = ['Baseline', 'Hypothesised value Remaining', 'CRS Raised', 'Remaining', 'Target']
    let ChartScores =  [this.props.Baseline, -this.props.HypVal, -this.props.CRVal,(this.props.Baseline - this.props.HypVal - this.props.CRVal) - (this.props.Baseline * 0.65), this.props.Baseline * 0.65]

    let data = {
      labels: ChartNames,
      datasets: [
        {
          label: 'Summary',
          backgroundColor: '#ffad33',
          borderColor: '#cc7a00',
          borderWidth: 1,
          hoverBackgroundColor: '#ffcc80',
          hoverBorderColor: '#cc7a00',
          data: ChartScores
        }
      ]
    };

    return (
      <div>
        <div className="Main">
          <Bar
            data={data}
            width={100}
            height={500}
            options={{
              plugins: {
                datalabels: {
                  display: true,
                  color: 'black',
                  formatter: function (value, context) {
                    value = '$' + value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    return value;
                  }
                }
              },
              responsive: true,
              scales: {
                yAxes: [{
                  ticks: {
                    userCallback: function (value, index, values) {
                      value = '$' + value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      return value;
                    }
                  }
                }]
              },
              maintainAspectRatio: false
            }}
          />
        </div>
      </div>
    );
  }
}

export default Chart;