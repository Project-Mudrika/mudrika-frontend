import { useWeb3 } from "@3rdweb/hooks";
import axios from "axios";
import Router from "next/router";
import React, { useState } from "react";
import { Card, Form, Button, Spinner, Modal } from "react-bootstrap";
import { Icon } from "@iconify/react";

import dashStyles from "../../styles/Dashboard.module.scss";

function RegisterForm() {
  // sign up form data
  // {
  // "acc_address": "577g9H03rH09kT6hf",
  // "first_name": "Sudev",
  // "last_name": "Suresh Sreedevi",
  // "username": "sudevssuresh",
  // "access_level_token": "7687yodf08ha"
  // }

  const { address } = useWeb3();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [accessLevelToken, setAccessLevelToken] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [modalShow, setModalShow] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let registerFormData = new FormData();
    registerFormData.append("acc_address", address);
    registerFormData.append("first_name", firstName);
    registerFormData.append("last_name", lastName);
    registerFormData.append("username", username);
    registerFormData.append("access_level_token", accessLevelToken);

    const res = await axios
      .post("https://mudrika.herokuapp.com/api/register/", registerFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .catch((err) => console.error(err));
    const data = await res?.data;
    console.log(data);
    setIsSubmitting(false);
    setFirstName("");
    setLastName("");
    setUsername("");
    setAccessLevelToken("");
    setIsSuccess(res?.status === 200);
    setModalShow(true);
  };

  return (
    <div className={dashStyles.Dashboard}>
      <Card
        bg="light"
        className={dashStyles.Dashboard_recent_cases}
        style={{ padding: "2rem" }}
      >
        <Card.Title>Register New User Account</Card.Title>
        <Card.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>Your WalletID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter WalletID"
                name="acc_address"
                value={address}
                readOnly={true}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter First Name"
                name="first_name"
                onInput={(e) => setFirstName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Last Name"
                name="last_name"
                onInput={(e) => setLastName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username"
                name="username"
                onInput={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Access Level Token (Given by IT admin)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Access Level Token"
                name="access_level_token"
                onInput={(e) => setAccessLevelToken(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Spinner animation="border" role={"status"} size="sm" />
              ) : (
                "Submit"
              )}
            </Button>
          </Form>
        </Card.Body>

        {/* <Button onClick={() => setModalShow(true)}>Show Modal</Button> */}
      </Card>
      <Modal
        show={modalShow}
        size="lg"
        backdrop="static"
        keyboard={false}
        centered
        onHide={() => setModalShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {isSuccess
              ? "New User Registration Successful!"
              : "New User Registration Failed!"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center align-items-center flex-column">
          <h4>
            {isSuccess ? (
              <Icon width="4rem" color="#1a7a05" icon="charm:circle-tick" />
            ) : (
              <Icon width="4rem" color="#870303" icon="charm:circle-cross" />
            )}{" "}
          </h4>
          <p>
            {isSuccess
              ? "Click Continue to login from home page."
              : "Something Went Wrong. Try again"}
          </p>
        </Modal.Body>
        <Modal.Footer>
          {isSuccess ? (
            <Button
              onClick={() => {
                setModalShow(false);
                Router.push("/");
              }}
              variant="success"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={() => {
                setModalShow(false);
              }}
              variant="danger"
            >
              Retry
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default RegisterForm;
