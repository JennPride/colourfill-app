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
      imgSrc: null,
      newFileName: null,
    };
  }

  updateCount(colorCount) {
    colorCount = parseInt(colorCount);
    if (typeof colorCount === "number") {
      this.setState({colorCount});
    }
  }

  resetApp() {
    this.setState({
      imgSrc: null,
      newFileName: null
    });
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

    this.setState({loading: true, imgSrc: null});
    axios.post('https://colorfill-server.herokuapp.com/submitImage', formData, {responseType: 'blob'}).then((result) => {
      const {error} = result.data;
      this.setState({loading: false});
      if (error) {
        this.setState({error, fileUpload: null});
      } else {
        const {fileUpload, colorCount} = this.state;
        const data = new Blob([result.data]);
        const imgSrc = window.URL.createObjectURL(data);
        this.setState({
          fileUpload: null,
          imgSrc,
          newFileName: `${colorCount}-${fileUpload.name}`,
        });
      }
    });
  }

  render() {

    const {
      colorCount,
      fileUpload,
      loading,
      error,
      imgSrc,
      newFileName
    } = this.state;

    return (
        <div className="App">
          <header className="App-header">
            <h1> Colorfill </h1>
            {loading ?
            <div className="App-loader">
              <img src={loadingImg} width="150px"/>
            </div>
              :
                (error ?
                  <div className="App-error">
                    <h2>Uh oh, we're having a little trouble right now. Please check back in a bit.</h2>
                  </div>
                :
              <div className="App-container">
                {imgSrc ?
                  <div className="App-results">
                    <img width="200px" src={imgSrc} alt="generated-color-block-image"/>
                    <div className="App-results-buttons">
                      <a href={imgSrc} download={newFileName}><button>Download</button></a>
                      <button onClick={() => this.resetApp()}> Try Another </button>
                    </div>
                  </div>
                    :
                    <div className="App-prompt">
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
                </div>
              )
            }
          </header>
        </div>
    );
  }
}

export default App;
