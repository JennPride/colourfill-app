import React from 'react';
import './App.css';
import axios from 'axios';
import loadingImg from './rings.svg';
import { HuePicker } from 'react-color';
// var { Hue } = require('react-color/lib/components/common');

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fileUpload: null,
      error: null,
      colorCount: 6,
      imgSrc: null,
      newFileName: null,
      isAutoSelect: false,
      customColors: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
      colorError: null,
    };
  }

  updateCount(colorCount) {
    let {customColors} = this.state;
    colorCount = parseInt(colorCount);
    if (typeof colorCount === "number") {
      if (customColors.length > colorCount) {
        customColors = customColors.slice(0, colorCount);
      } else {
        while (customColors.length < colorCount) {
          customColors.push('#FFFFFF');
        }
      }
    }
    this.setState({colorCount, customColors});
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

  isValidColor(colorString) {
    return /^#[0-9A-F]{6}$/i.test(colorString);
  }

  getColorInputsOld() {
    const {customColors} = this.state;
    return (customColors.map((customColor, i) =>
          <div className="App-colorInput">
              <label htmlFor={`${i}-customColors`}> Color #{i+1} </label>
              <input placeholder="#E94057" value={customColor} id={`${i}-customColors`} type="text" onChange={(e) => {
                this.updateColors(e.target.value, i)
              }}/>
              {
                this.isValidColor(customColor) &&
                <div className="App-colorDisplay" style={{background: customColor}} />
              }
          </div>
      )
    )
  }

    getColorInputs() {
        const {customColors} = this.state;
        return (customColors.map((customColor, i) =>
                <div className="App-colorInput">
                    <label htmlFor={`${i}-customColors`}> Color #{i+1} </label>
                    <HuePicker width="100%" color={customColor} onChangeComplete={(value) => this.updateColors(value, i)}/>
                    <input placeholder="#HEXVAL" value={customColor} id={`${i}-customColors`} type="text" onChange={(e) => {
                        this.updateColors(e.target.value, i)
                    }}/>
                </div>
            )
        )
    }

  updateColors(color, index) {
      console.log(color);
    const {customColors} = this.state;
    customColors[index] = color.hex;
    this.setState({customColors});
  }

  toggleAutoSelect(value) {
      this.setState({isAutoSelect: value === "true"});
  }

  getAppPrompt() {
    const {
      colorCount,
      fileUpload,
      isAutoSelect,
      colorError
    } = this.state;

    return (
        <div className="App-prompt">
          <h2> Our program will recolor your image to use either the most dominant colors or your choice of colors. </h2>
          <div className="App-inputs">
            <div className="App-inputSection">
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
            <div className="App-inputSection">
                <div className="App-input">
                  <label htmlFor="colorCount" className="App-numColorInput"> Number of Colors: </label>
                  <input value={colorCount} id="colorCount" type="number" min="1" max="25" onChange={(e) => {
                    this.updateCount(e.target.value)
                  }}/>
                </div>
                <div className="App-input">
                  <label>
                    <input type="radio" value="true" checked={isAutoSelect} className="autoDetect" onChange={(e) => this.toggleAutoSelect(e.target.value)}/> Auto Detect Colors
                  </label>
                  <br/>
                  <label>
                    <input type="radio" value="false" checked={!isAutoSelect} className="customColors" onChange={(e) => this.toggleAutoSelect(e.target.value)}/> Custom Colors
                  </label>
                </div>
                {
                  !isAutoSelect &&
                      <div>
                        <div className="App-colorInputs">
                          { this.getColorInputs() }
                        </div>

                        {colorError &&
                          <div className="App-inputError">{colorError}</div>
                        }
                      </div>
                }
            </div>

            </div>
          </div>
          {fileUpload &&
          <button className="App-fileSubmit" onClick={()=>this.handleFileSubmit()}> Create </button>
          }
        </div>
    )
  }

  handleFileSubmit() {

    const {fileUpload, colorCount, customColors, isAutoSelect} = this.state;
    let isValid = true;

    if (!isAutoSelect) {
      for (const color of customColors) {
        if (!this.isValidColor(color)) {
          this.setState({colorError: "Uh oh, looks like one of the color values you added isn't valid."});
          isValid = false;
        }
      }
    }

    if (isValid) {
      this.setState({colorError: null});
      const formData = new FormData();
      formData.append(
          "fileUpload",
          fileUpload,
      );
      formData.append(
          "numColors",
          colorCount
      );
      if (!isAutoSelect) {
        formData.append(
            "colors",
            customColors
        );
      }
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
  }

  render() {

    const {
      loading,
      error,
      imgSrc,
      newFileName,
    } = this.state;

    return (
        <div className="App">
          <header className="App-header">
            <h1> Colorfill </h1>
            <div className="App-container">
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
                (imgSrc ?
                  <div className="App-results">
                    <img src={imgSrc} alt="generated-color-block-image"/>
                    <div className="App-results-buttons">
                      <a href={imgSrc} download={newFileName}><button>Download</button></a>
                      <button onClick={() => this.resetApp()}> Try Another </button>
                    </div>
                  </div>
                    :
                    this.getAppPrompt()
                )
              )
            }
            </div>
            <div className="App-blurb">
              <h3>Forever inspired by other amazing artists. Discover and support some of them: </h3>
              <ul className="App-links">
                <li><a href="https://society6.com/posters/digital?curator=designwithpride" rel="noopener noreferrer" target="_blank">Society6</a></li>
              </ul>
            </div>
          </header>
        </div>
    );
  }
}

export default App;
