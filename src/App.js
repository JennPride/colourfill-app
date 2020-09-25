import React from 'react';
import './App.css';
import axios from 'axios';
import loadingImg from './rings.svg';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fileUpload: null,
      error: null,
      colorCount: 10,
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
    axios.post('http://localhost:3000/submitImage', formData, {responseType: 'blob'}).then((result) => {
      const {error} = result.data;
      this.setState({loading: false, fileUpload: null});
      if (error) {
        this.setState({error});
      } else {
        const {fileUpload, colorCount} = this.state;
        let data = new Blob([result.data]);
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(data);
        link.download = `${colorCount}-${fileUpload.name}`;
        document.body.appendChild(link);
        link.click();
      }
    });
  }

  render() {

    const {colorCount, fileUpload, loading} = this.state;

    return (
        <div className="App">
          <header className="App-header">
            <h1> Colorfill </h1>
            {loading ?
            <div className="App-loader">
              <img src={loadingImg} width="150px"/>
            </div>
              :
            <div className="App-container">
              <h2> Please upload a PNG and select how many colors you would like!</h2>
              <p> Our program will recolor your image to use only the most dominant colors - creating a unique stylized picture.</p>
              <div className="App-inputs">
                <div className="App-input">
                  <label htmlFor="colorCount"> Number of Colors: </label>
                  <input value={colorCount} id="colorCount" type="number" min="1" max="25" onChange={(e) => {
                    this.updateCount(e.target.value)
                  }}/>
                </div>
                <div className="App-input">
                  <label className="App-input-file">
                    <input type="file" id="originalFile" accept="image/png" onChange={(e) => {
                      this.handleFileUpload(e)
                    }}/>
                    Upload PNG
                  </label>
                  {!fileUpload ?
                    <p>No File Selected</p>
                    :
                    <p>{fileUpload.name}</p>
                  }
                </div>
              </div>
              {fileUpload &&
                <button onClick={()=>this.handleFileSubmit()}> Create </button>
              }
            </div>
            }
          </header>
        </div>
    );
  }
}

export default App;
