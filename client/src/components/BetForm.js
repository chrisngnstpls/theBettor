import React, { Component } from 'react'
import { Form, Input, TextArea, Button, Select } from 'semantic-ui-react'



class BetForm extends Component {
  state = {}

  handleChange = (e, { value }) => this.setState({ value })

  render() {
    const { value } = this.state
    return (
        <Form>
            <Form.Group widths="equal">
                <Form.Field
                    id="form-input-control-address"
                    control={Input}
                    label="Address"
                    placeholder = 'Address'
                    
                />
                <Form.Field
                    id="form-input-control-name"
                    control = {Input}
                    label = "Reason"
                    placeholder = "reason"
                />
                <Form.Field
                    id="form-input-control-fee"
                    control = {Input}
                    label = "Fee"
                    placeholder="fee"
                />
                <Form.Field 
                    id="form-input-control-fee"
                    control={Input}
                    content="Bet size"
                    label="Bet size"
                />
                <Form.Field 
                    id="form-button-control-public"
                    control={Button}
                    content="Bet go"
                    label = 'Initiate Bet'
                />
            </Form.Group>
        </Form>
    )
  }
}

export default BetForm