import React from 'react';
import './App.css';
import axios from 'axios';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fileUpload: null,
      error: null,
      colorCount: 10,
      downloadLink: null,
    };
  }

  updateCount(colorCount) {
    colorCount = parseInt(colorCount);
    if (typeof colorCount === "number") {
      this.setState({colorCount});
    }
  }

  handleFileUpload(event) {
    const fileUpload = event.target.files[0];
    this.setState({fileUpload});
  }

  handleFileSubmit() {
    const {fileUpload, colorCount} = this.state;
    const formData = new FormData();
    formData.append(
        "fileUpload",
        fileUpload,
    );
    formData.append(
        "numColors",
        colorCount
    );

    this.setState({loading: true});
    axios.post('http://localhost:3000/submitImage', formData).then((result) => {
      const {error, newImage} = result.data;
      if (error) {
        this.setState({error});
      } else {
        this.setState({downloadLink: newImage});
      }
    });
  }

  render() {

    const {colorCount, downloadLink} = this.state;

    return (
        <div className="App">
          <header className="App-header">
            <h1> Colourfill </h1>
            <div className="App-Container">
              <h1> Please upload a PNG and select how many colors you would like!</h1>
              <input value={colorCount} type="number" min="1" max="25" onChange={(e) => {this.updateCount(e.target.value)}}/>
              <input type="file" id="originalFile" accept="image/png" onChange={(e) => {this.handleFileUpload(e)}} />
              <button onClick={()=>this.handleFileSubmit()}> Create </button>
              {
                downloadLink && (
                    <a href={downloadLink} download={downloadLink}>
                      <button>Download</button>
                    </a>
                )
              }
            </div>
          </header>
        </div>
    );
  }
}

export default App;
