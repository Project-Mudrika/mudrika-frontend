import React, { useEffect, useState } from "react";
import {
  Card,
  Modal,
  Button,
  Form,
  Spinner,
  Table,
  Tabs,
  Tab,
} from "react-bootstrap";
import { Icon } from "@iconify/react";
import Router from "next/router";
import axios from "axios";

import dashStyles from "../../styles/Dashboard.module.scss";
import states from "../../helpers/stateList";

function DeptQueryForm() {
  const [access_level, setAccessLevel] = useState("district");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  const [isNational, setIsNational] = useState(false);
  const [isState, setIsState] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const tableData = {
    dma_name: "District Disaster Management Authority",
    state_name: "Kerala",
    district_name: "Ernakulam",
    incoming: [
      {
        type: "consignment",
        consignment_name: "Food Supplies",
        from: {
          level: "district",
          name: "District Disaster Management Authority",
          state: "Kerala",
          district: "Thrissur",
        },
        amount: 500.0,
        timestamp: 1647590400,
      },
      {
        type: "fund",
        reason: "COVID-19 relief",
        from: {
          level: "state",
          name: "State Disaster Management Authority",
          state: "Kerala",
        },
        amount: 2000.0,
        timestamp: 1647945600,
      },
    ],
    outgoing: [
      {
        type: "consignment",
        consignment_name: "Medical Supplies",
        to: {
          level: "district",
          name: "District Disaster Management Authority",
          state: "Kerala",
          district: "Thrissur",
        },
        amount: 750.0,
        timestamp: 1645766400,
      },
      {
        type: "fund",
        reason: "Disaster response",
        to: {
          level: "state",
          name: "State Disaster Management Authority",
          state: "Kerala",
        },
        amount: 1000.0,
        timestamp: 1646414400,
      },
    ],
  };

  useEffect(() => {
    setIsNational(access_level === "national");
    setIsState(access_level === "state");

    if (access_level === "national") {
      setState("");
      setDistrict("");
    }

    if (access_level === "state") {
      setDistrict("");
    }

    return () => {
      setState("");
      setDistrict("");
      setIsNational(false);
      setIsState(false);
    };
  }, [access_level]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [modalShow, setModalShow] = useState(false);
  const [response, setResponse] = useState({});

  const [startDate, setStartDate] = useState(""); // Initialize selected date as null
  const [endDate, setEndDate] = useState("");
  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let tokenFormData = new FormData();
    tokenFormData.append("access_level", access_level);
    tokenFormData.append("state", state);
    tokenFormData.append("district", district);
    tokenFormData.append("date", startDate); // Append selected date to form data

    const res = await axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/new-access-token/`,
        tokenFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .catch((err) => console.error(err));
    const data = await res?.data;

    setResponse(data);
    setIsSubmitting(false);
    setAccessLevel("");
    setState("");
    setDistrict("");
    setStartDate(null); // Reset selected date to null after form submission
    setEndDate(null);
    setIsSuccess(res?.status === 200);
    setModalShow(true);
  };

  return (
    // form_format
    // {
    //   "access_level" : "national | state | district",
    //   "state": "null | str",
    //   "district": "null | str",
    //   "date": "null | str"
    // }

    <div className={dashStyles.Dashboard}>
      <Card
        bg="light"
        className={dashStyles.Dashboard_recent_cases}
        style={{ padding: "2rem" }}
      >
        <Card.Title>Search By Department</Card.Title>
        <Card.Body>
          <Form
            onSubmit={submitHandler}
            className={
              "d-flex align-items-center justify-content-center flex-wrap"
            }
          >
            <Form.Group
              className="d-flex align-items-center"
              style={{ marginRight: 16 }}
            >
              <Form.Label style={{ marginRight: 4, whiteSpace: "nowrap" }}>
                Dept. Level
              </Form.Label>
              <select
                name="access_level"
                label="Access Level"
                className="mb-2 form-control"
                style={{ width: 150 }}
                onChange={(e) => setAccessLevel(e.target.value)}
                value={access_level}
              >
                <option value="district">District</option>
                <option value="state">State</option>
                <option value="national">National</option>
              </select>
            </Form.Group>
            <Form.Group
              className="d-flex align-items-center"
              style={{ marginRight: 16 }}
            >
              <Form.Label style={{ marginRight: 4, whiteSpace: "nowrap" }}>
                State
              </Form.Label>
              <select
                name="state"
                label="State"
                className="mb-2 form-control"
                disabled={isNational}
                required={!isNational}
                onChange={(e) => setState(e.target.value)}
                value={state}
              >
                <option value="">-- Select State --</option>
                {states.map((state) => {
                  const stateValue = Object.keys(state)[0];
                  const stateName = stateValue
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, function (str) {
                      return str.toUpperCase();
                    });
                  return <option value={stateValue}>{stateName}</option>;
                })}
              </select>
              <Form.Control.Feedback type="invalid">
                Please select a state.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group
              className="d-flex align-items-center"
              style={{ marginRight: 16 }}
            >
              <Form.Label style={{ marginRight: 4, whiteSpace: "nowrap" }}>
                District
              </Form.Label>
              <select
                name="district"
                label="District"
                className="mb-2 form-control"
                disabled={isNational || isState || !state}
                required={!isNational && !isState}
                onChange={(e) => setDistrict(e.target.value)}
                value={district}
              >
                <option value="">-- Select District --</option>
                {state &&
                  // Map through each district in the state
                  states.map((stateList) => {
                    if (stateList[state]) {
                      return stateList[state].map((district) => {
                        return <option value={district}>{district}</option>;
                      });
                    }
                  })}
              </select>
            </Form.Group>
            <div
              style={{
                flexBasis: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "15px",
              }}
            >
              <Form.Group
                className="d-flex align-items-center"
                style={{ marginRight: 16 }}
              >
                <Form.Label style={{ marginRight: 4, whiteSpace: "nowrap" }}>
                  Select Start Date:
                </Form.Label>
                <br />
                <Form.Control
                  type="date"
                  onChange={(e) => setStartDate(e.target.value)}
                  value={startDate}
                />
              </Form.Group>
              <Form.Group
                className="d-flex align-items-center"
                style={{ marginRight: 16 }}
              >
                <Form.Label style={{ marginRight: 4, whiteSpace: "nowrap" }}>
                  Select End Date:
                </Form.Label>
                <Form.Control
                  type="date"
                  onChange={(e) => setEndDate(e.target.value)}
                  value={endDate}
                  min={startDate}
                />
              </Form.Group>
            </div>

            <Form.Control.Feedback type="invalid">
              Please select a district.
            </Form.Control.Feedback>

            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: "20px",
                flexBasis: "10%",
                width: "fit-content",
              }}
            >
              {isSubmitting ? (
                <Spinner animation="border" role={"status"} size="sm" />
              ) : (
                "Search"
              )}
            </Button>
          </Form>
        </Card.Body>
        <Tabs defaultActiveKey="incoming" className="mb-3">
          <Tab eventKey="incoming" title="Incoming">
            <Table striped bordered hover>
              <thead className="text-center">
                <tr>
                  <th>Sl.No</th>
                  <th>Sender</th>

                  <th>Transaction Type</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.incoming?.map((transaction, index) => {
                  const timestamp = new Date(transaction.timestamp);
                  return (
                    <tr>
                      <td>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: "bold" }}>
                          {transaction.from.name}
                        </div>
                        <div
                          className="mt-1"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "14px",
                          }}
                        >
                          {transaction.from.district ? (
                            <div>{transaction.from.district}</div>
                          ) : null}
                          {transaction.from.state ? (
                            <div className="ms-auto">
                              {transaction.from.state}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td>{transaction.type}</td>
                      <td>{transaction.amount}</td>
                      <td>{timestamp.toUTCString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="outgoing" title="Outgoing">
            <Table striped bordered hover>
              <thead className="text-center">
                <tr>
                  <th>Sl.No</th>
                  <th>Receiver</th>

                  <th>Transaction Type</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.outgoing?.map((transaction, index) => {
                  const timestamp = new Date(transaction.timestamp);
                  return (
                    <tr>
                      <td>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: "bold" }}>
                          {transaction.to.name}
                        </div>
                        <div
                          className="mt-1"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "14px",
                          }}
                        >
                          {transaction.to.district ? (
                            <div>{transaction.to.district}</div>
                          ) : null}
                          {transaction.to.state ? (
                            <div className="ms-auto">
                              {transaction.to.state}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td>{transaction.type}</td>
                      <td>{transaction.amount}</td>
                      <td>{timestamp.toUTCString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
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
              ? "Token Generation Successful!"
              : "Token Generation Failed!"}
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

          {isSuccess ? (
            <p>
              IMPORTANT!! Please copy the token information below before closing
              this window.
              <blockquote
                style={{
                  width: "100%",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "5px",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <code>Access Level Token : {response.access_phrase}</code>
                <Button
                  variant="light"
                  style={{
                    backgroundColor: "#dddddd",
                    marginLeft: "auto",
                  }}
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(response.access_phrase);
                    alert("Copied to clipboard");
                  }}
                >
                  <Icon width="1rem" icon="charm:copy" color="#999999" />
                </Button>
              </blockquote>
            </p>
          ) : (
            <p>Something Went Wrong. Try again</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isSuccess ? (
            <Button
              onClick={() => {
                setModalShow(false);
                Router.push("/dashboard");
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

export default DeptQueryForm;
